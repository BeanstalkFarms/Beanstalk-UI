import { useCallback, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';

import { useBeanstalkContract, useBeanstalkPriceContract } from 'hooks/useContract';
import { tokenResult } from 'util/TokenUtilities';
import { BEAN, ERC20_TOKENS } from 'constants/v2/tokens';
import useTokenMap from 'hooks/useTokenMap';
import usePools from 'hooks/usePools';
import { resetPools, updateBeanPools, UpdatePoolPayload } from './actions';
import { updateBeanPrice } from '../reducer';
import { useWhatChanged } from '@simbathesailor/use-what-changed';
import { Beanstalk, BeanstalkPrice } from 'constants/generated';
import { PoolsByAddress } from 'constants/v2/pools';
import useChainId from 'hooks/useChain';

export const useGetPools = () => {
  const dispatch = useDispatch();
  const beanstalkPriceContract = useBeanstalkPriceContract();
  const POOLS = usePools();
  console.debug(`[bean/pools/useGetPools] render`)

  useWhatChanged([
    dispatch,
    beanstalkPriceContract,
    POOLS
  ], 'dispatch, price, tokens, pools');

  // Handlers
  const fetch = useCallback(
    async () => {
      if (beanstalkPriceContract) {
        console.debug('[bean/pools/useGetPools] fetch ', beanstalkPriceContract.address);

        let result;
        try {
          // Step 1: Get Price contract data
          result = await beanstalkPriceContract.price();
        } catch(e) {
          console.error(e)
          console.error(beanstalkPriceContract.price)
        }
        
        if (!result) return;
        console.debug('[bean/pools/useGetPools] result', result);

        // Step 2: Get LP token supply data and format as UpdatePoolPayload
        const beanPools : (Promise<UpdatePoolPayload>)[] = [
          ...result.ps.reduce<(Promise<UpdatePoolPayload>)[]>((acc, poolData) => {
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
            } else {
              console.debug(`[bean/pools/useGetPools] price contract returned data for pool ${address} but it isn't configured, skipping. available pools:`, POOLS)
            }
            return acc;
          }, [])
        ];
        
        // 
        dispatch(updateBeanPools(await Promise.all(beanPools)));
        dispatch(updateBeanPrice(tokenResult(BEAN)(result.price.toString())));
      }
    },
    [
      dispatch,
      beanstalkPriceContract,
      POOLS
    ]
  );
  const clear = useCallback(() => {}, []);

  return [fetch, clear];
};

// -- Updater

const PoolsUpdater = () => {
  const [fetch] = useGetPools();
  const chainId = useChainId();
  const dispatch = useDispatch();

  //
  useEffect(() => {
    console.debug(`[bean/pools/updater] resetting pools`)
    dispatch(resetPools());
  }, [dispatch, chainId]);

  //
  useEffect(() => {
    fetch();
  }, [fetch]);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return null;
};

export default PoolsUpdater;
