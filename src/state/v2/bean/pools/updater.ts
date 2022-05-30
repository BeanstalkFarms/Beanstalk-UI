import { useCallback, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';
import { useBeanstalkPriceContract } from 'hooks/useContract';
import { tokenResult } from 'util/TokenUtilities';
import { BEAN } from 'constants/v2/tokens';
import { getChainConstant } from 'hooks/useChainConstant';
import POOLS from 'constants/v2/pools';
import { resetPools, updateBeanPools, UpdatePoolPayload } from './actions';
import { updateBeanPrice } from '../reducer';

export const useGetPools = () => {
  const dispatch = useDispatch();
  const [beanstalkPriceContract, chainId] = useBeanstalkPriceContract();

  // useWhatChanged([
  //   dispatch,
  //   beanstalkPriceContract,
  //   pools
  // ], 'dispatch, price, pools');

  // Handlers
  const fetch = useCallback(
    async () => {
      try {
        if (beanstalkPriceContract) {
          console.debug('[bean/pools/useGetPools] FETCH', beanstalkPriceContract.address, chainId);
          const pools = getChainConstant(POOLS, chainId);
          const priceResult = await beanstalkPriceContract.price();
          if (!priceResult) return;

          console.debug('[bean/pools/useGetPools] RESULT: price contract result =', priceResult);

          // Step 2: Get LP token supply data and format as UpdatePoolPayload
          const dataWithSupplyResult : (Promise<UpdatePoolPayload>)[] = [
            ...priceResult.ps.reduce<(Promise<UpdatePoolPayload>)[]>((acc, poolData) => {
              const address = poolData.pool;
              // If a new pool is added to the Pools contract before it's
              // configured in the frontend, this function would throw an error.
              // Thus, we only process the pool's data if we have it configured.
              if (pools[address]) {
                const POOL = pools[address];
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
                console.debug(`[bean/pools/useGetPools] price contract returned data for pool ${address} but it isn't configured, skipping. available pools:`, pools);
              }
              return acc;
            }, [])
          ];

          console.debug('[bean/pools/useGetPools] RESULT: dataWithSupply =', dataWithSupplyResult);
          
          dispatch(updateBeanPools(await Promise.all(dataWithSupplyResult)));
          dispatch(updateBeanPrice(tokenResult(BEAN)(priceResult.price.toString())));
        }
      } catch (e) {
        console.debug('[bean/pools/useGetPools] FAILED', e);
        console.error(e);
      }
    },
    [
      dispatch,
      beanstalkPriceContract,
      chainId,
    ]
  );
  const clear = useCallback(() => {
    dispatch(resetPools());
  }, [dispatch]);

  return [fetch, clear];
};

// ------------------------------------------

const PoolsUpdater = () => {
  const [fetch, clear] = useGetPools();

  useEffect(() => {
    clear();
    fetch();
  }, [
    fetch,
    clear
  ]);
  
  return null;
};

export default PoolsUpdater;
