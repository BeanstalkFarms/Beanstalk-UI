import { useCallback, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';

import { useBeanstalkContract, useBeanstalkPriceContract } from 'hooks/useContract';
import { tokenResult } from 'util/TokenUtilities';
import { BEAN, ERC20_TOKENS } from 'constants/v2/tokens';
import useTokenMap from 'hooks/useTokenMap';
import usePools from 'hooks/usePools';
import { updateBeanPools, UpdatePoolPayload } from './actions';
import { updateBeanPrice } from '../reducer';

export const useGetPools = () => {
  const dispatch = useDispatch();
  const beanstalkPriceContract = useBeanstalkPriceContract();
  const beanstalk = useBeanstalkContract();
  const TOKENS = useTokenMap(ERC20_TOKENS);
  const POOLS = usePools();

  // Handlers
  const fetch = useCallback(
    async () => {
      if (beanstalk && beanstalkPriceContract) {
        const result = await Promise.all([
          beanstalk.totalDepositedBeans(),
          // beanstalk?.getTotalDeposited()
          beanstalkPriceContract.price()
        ]);
        if (!result) return;
        console.debug('[bean/pools/updater] result', result, TOKENS);
        const beanPools : (Promise<UpdatePoolPayload>)[] = [
          // All
          ...result[1].ps.reduce<(Promise<UpdatePoolPayload>)[]>((acc, poolData) => {
            const address = poolData.pool;
            // If a new pool is added to the Pools contract before it's
            // configured in the frontend, this function would throw an error.
            // Thus, we only process the pool's data if we have it configured.
            if (POOLS[address]) {
              const POOL = POOLS[address];
              acc.push(
                POOL.lpToken.getTotalSupply().then((supply) => ({
                  address: poolData.pool,
                  pool: {
                    price: tokenResult(BEAN)(poolData.price.toString()),
                    reserves: [
                      // NOTE:
                      // Assumes that the ordering of tokens in the Pool instance
                      // matches the order returned by the price contract.
                      tokenResult(POOL.tokens[0])(poolData.balances[0]),
                      tokenResult(POOL.tokens[1])(poolData.balances[1]),
                    ],
                    deltaB: tokenResult(BEAN)(poolData.deltaB.toString()),
                    supply: tokenResult(POOL.lpToken)(supply.toString()),
                    liquidity: tokenResult(BEAN)(poolData.liquidity.toString()),
                    totalCrosses: new BigNumber(0),
                  },
                }))
              );
            }
            return acc;
          }, [])
        ];
        dispatch(updateBeanPools(await Promise.all(beanPools)));
        dispatch(updateBeanPrice(tokenResult(BEAN)(result[1].price.toString())));
      }
    },
    [
      dispatch,
      beanstalkPriceContract,
      beanstalk,
      TOKENS,
      POOLS
    ]
  );
  const clear = useCallback(() => {}, []);

  return [fetch, clear];
};

// -- Updater

const PoolsUpdater = () => {
  const [fetch] = useGetPools();

  useEffect(() => {
    fetch();
  }, [fetch]);

  return null;
};

export default PoolsUpdater;
