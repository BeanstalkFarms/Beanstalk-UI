import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import flatMap from 'lodash/flatMap';
import { ZERO_BN } from 'constants/index';
import { Beanstalk, BeanstalkReplanted } from 'generated/index';
import { BALANCE_TOKENS, ERC20_TOKENS, ETH } from 'constants/tokens';
import useChainId from 'hooks/useChain';
import { useBeanstalkContract } from 'hooks/useContract';
import useMigrateCall from 'hooks/useMigrateCall';
import useTokenMap from 'hooks/useTokenMap';
import { tokenResult } from 'util/index';
import useChainConstant from 'hooks/useChainConstant';
import useAccount from 'hooks/ledger/useAccount';
import { clearBalances, updateBalances } from './actions';

// -- Hooks

export const useFetchFarmerBalances = () => {
  // State
  const dispatch = useDispatch();
  const account  = useAccount();
  
  // Constants
  const Eth = useChainConstant(ETH);
  const tokenMap = useTokenMap(BALANCE_TOKENS);
  const erc20TokenMap = useTokenMap(ERC20_TOKENS);

  // Contracts
  const beanstalk = useBeanstalkContract();
  const migrate   = useMigrateCall();

  // Handlers
  // FIXME: make this callback accept a tokens array to prevent reloading all balances on every call
  const fetch = useCallback(async () => {
    try {
      if (account && tokenMap) {
        const balancePromises = migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          // V1
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
          // V2
          async (beanstalkReplanted) => {
            const erc20Addresses = Object.keys(erc20TokenMap);
            const promises = [
              // ETH cannot have an internal balance and isn't returned
              // from the standard getAllBalances call.
              // multiCall.getEthBalance(account)
              Eth.getBalance(account)
                .then(tokenResult(Eth))
                .then((result) => ({
                  token: Eth,
                  balance: {
                    internal: ZERO_BN,
                    external: result,
                    total:    result,
                  },
                })),
              beanstalkReplanted.getAllBalances(account, erc20Addresses)
                .then((result) => {
                  console.debug('[farmer/balances/updater]: getAllBalances = ', result);
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
                  };
                })),
            ];
            // const calls = [
            //   // ETH cannot have an internal balance and isn't returned
            //   // from the standard getAllBalances call.
            //   multiCall.getEthBalance(account),
            //   wrap(beanstalkReplanted).getAllBalances(account, erc20Addresses)
            // ];

            // const data = await multiCall.all(calls as unknown as ContractCall[]);
            // .then((results) => flatMap(results))
            return Promise.all(promises).then((results) => flatMap(results));
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
    // multiCall,
    // wrap,
    beanstalk,
    Eth,
    erc20TokenMap,
    migrate,
    account,
  ]);

  const clear = useCallback(() => {
    dispatch(clearBalances());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// -- Updater

const FarmerBalancesUpdater = () => {
  const [fetch, clear] = useFetchFarmerBalances();
  const account = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    clear();
    if (account) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    account,
    chainId,
  ]);

  return null;
};

export default FarmerBalancesUpdater;
