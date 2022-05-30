import { BALANCE_TOKENS } from 'constants/v2/tokens';
import useChainId from 'hooks/useChain';
import useTokenMap from 'hooks/useTokenMap';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { tokenResult } from 'util/TokenUtilities';
import { useAccount } from 'wagmi';
import { clearBalances, updateBalances } from './actions';

// -- Hooks

export const useFetchFarmerBalances = () => {
  const dispatch = useDispatch();
  const tokens = useTokenMap(BALANCE_TOKENS);

  // Handlers
  // FIXME: make this callback accept a tokens array to prevent reloading all balances on every call
  const fetch = useCallback(async (account: string/* , _tokens? : any */) => {
    try {
      if (account && tokens) {
        const balancePromises = Object.keys(tokens).map((tokenAddr) => (
          tokens[tokenAddr]?.getBalance(account)
            .then(tokenResult(tokens[tokenAddr]))
            .then((result) => {
              console.debug(`[farmer/balances/updater] | ${tokens[tokenAddr].symbol} => ${result.toString()}`);
              return result;
            })
            .then((balanceResult) => ({
              token: tokens[tokenAddr],
              balance: balanceResult
            }))
        ));

        console.debug(`[farmer/updater/useFetchBalances] FETCH: ${balancePromises.length} balances (account = ${account})`);
        const balances = await Promise.all(balancePromises);
        console.debug('[farmer/updater/useFetchBalances] RESULT: ', balances);
        // console.table(balances);

        dispatch(updateBalances(balances));
        return balancePromises;
      }
    } catch (e) {
      console.debug('[farmer/updater/useFetchBalances] FAILED', e);
      console.error(e);
    }
  }, [
    dispatch,
    tokens
  ]);

  const clear = useCallback(() => {
    dispatch(clearBalances());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// -- Updater

const FarmerBalancesUpdater = () => {
  const [fetch, clear] = useFetchFarmerBalances();
  const { data: account } = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    clear();
    if (account?.address) {
      fetch(account.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    account?.address,
    chainId,
  ]);

  return null;
};

export default FarmerBalancesUpdater;
