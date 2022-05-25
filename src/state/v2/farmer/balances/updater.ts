import { ERC20Tokens } from 'constants/v2/tokens';
import useTokenList from 'hooks/useTokenList';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { tokenResult } from 'util/LedgerUtilities2';
import { useAccount } from 'wagmi';
import { clearBalances, updateBalances } from './actions';

// -- Hooks

export const useFetchBalances = () => {
  const dispatch = useDispatch();
  const tokens = useTokenList(ERC20Tokens);

  // Handlers
  const fetch = useCallback(async (address: string) => {
    if (address && tokens) {
      const balances = Object.keys(tokens).map((tokenAddr) => {
        console.debug(`[farmer/balances/updater] updating token ${tokens[tokenAddr].name} ${tokenAddr}`);
        return (
          tokens[tokenAddr]?.getBalance(address)
            .then(tokenResult(tokens[tokenAddr]))
            .then((result) => {
              console.debug(`[farmer/balances/updater] ${tokens[tokenAddr].name} ${tokens[tokenAddr].chainId} ${tokens[tokenAddr]} => ${result.toString()}`);
              return result;
            })
            .then((balanceResult) => ({
              token: tokens[tokenAddr],
              balance: balanceResult
            }))
        );
      });

      dispatch(updateBalances(
        await Promise.all(balances)
      ));
      return balances;
    }
  }, [
    dispatch,
    tokens
  ]);

  const clear = useCallback(() => {
    dispatch(clearBalances());
  }, [dispatch]);

  return [fetch, clear];
};

// -- Updater

const BalancesUpdater = () => {
  const { data: account } = useAccount();
  const [fetch, clear] = useFetchBalances();

  useEffect(() => {
    if (account?.address) {
      fetch(account.address);
    } else {
      clear();
    }
  }, [
    account,
    fetch,
    clear
  ]);

  return null;
};

export default BalancesUpdater;
