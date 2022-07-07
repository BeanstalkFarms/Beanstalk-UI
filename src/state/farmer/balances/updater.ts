import { ZERO_BN } from 'constants/index';
import { Beanstalk, BeanstalkReplanted } from 'constants/generated';
import { BALANCE_TOKENS, ERC20_TOKENS } from 'constants/tokens';
import useChainId from 'hooks/useChain';
import { useBeanstalkContract } from 'hooks/useContract';
import useMigrateCall from 'hooks/useMigrateCall';
import useTokenMap from 'hooks/useTokenMap';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAccount } from 'util/Account';

import { tokenResult } from 'util/Tokens';
import { useAccount } from 'wagmi';
import { clearBalances, updateBalances } from './actions';

// -- Hooks

export const useFetchFarmerBalances = () => {
  const dispatch = useDispatch();
  const tokenMap = useTokenMap(BALANCE_TOKENS);
  const erc20TokenMap = useTokenMap(ERC20_TOKENS);
  const beanstalk = useBeanstalkContract();
  const migrate = useMigrateCall();

  // Handlers
  // FIXME: make this callback accept a tokens array to prevent reloading all balances on every call
  const fetch = useCallback(async (_account: string/* , _tokens? : any */) => {
    const account = getAccount(_account);
    try {
      if (account && tokenMap) {
        const balancePromises = migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          async () => Promise.all(Object.keys(tokenMap).map((tokenAddr) => (
            tokenMap[tokenAddr]?.getBalance(account)
              .then(tokenResult(tokenMap[tokenAddr]))
              .then((balanceResult) => ({
                token: tokenMap[tokenAddr],
                balance: {
                  internal: ZERO_BN,
                  external: balanceResult,
                  total:    balanceResult,
                },
              }))
          ))),
          async (b) => {
            const erc20Addresses = Object.keys(erc20TokenMap);
            return b.getAllBalances(account, erc20Addresses)
              .then((result) => {
                console.debug(`[farmer/balances/updater]: getAllBalances = `, result)
                return result;
              })
              .then((result) => result.map((struct, index) => {
                const _token = erc20TokenMap[erc20Addresses[index]];
                const _tokenResult = tokenResult(_token);
                return {
                  token: _token,
                  balance: {
                    internal: _tokenResult(struct.internalBalance),
                    external: _tokenResult(struct.externalBalance),
                    total:    _tokenResult(struct.totalBalance),
                  }
                }
              }))
          }
        ]);

        console.debug(`[farmer/updater/useFetchBalances] FETCH: balances (account = ${account})`);
        const balances = await balancePromises;
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
    tokenMap,
    // replanted
    beanstalk,
    erc20TokenMap,
    migrate
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
