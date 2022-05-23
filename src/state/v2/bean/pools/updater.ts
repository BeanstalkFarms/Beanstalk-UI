import { useCallback, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';

import { useBeanstalkPriceContract } from 'hooks/useContract';
import { tokenResult } from 'util/LedgerUtilities2';
import { BEAN } from 'constants/v2/tokens';
import { updateBeanPools, UpdatePoolPayload } from './actions';

export const useGetPools = () => {
  const dispatch = useDispatch();
  const beanstalkPriceContract = useBeanstalkPriceContract();

  // Handlers
  const fetch = useCallback(async () => 
     beanstalkPriceContract?.price().then((result) => {
      const _pools = result.ps.map((poolData) => ({
          address: poolData.pool,
          pool: {
            price: tokenResult(BEAN)(poolData.price.toString()),
            reserves: [
              new BigNumber(poolData.balances[0].toString()),
              new BigNumber(poolData.balances[1].toString()),
            ],
            deltaB: new BigNumber(poolData.deltaB.toString()),
            totalCrosses: new BigNumber(0),
          }
        } as UpdatePoolPayload));
      dispatch(updateBeanPools(_pools));
    }),

    // const _pools = await Promise.all(
    //   Object.values(pools).map((pool) => {
    //     const calls = [
    //       pool.lpToken.getTotalSupply(),
    //       pool.getReserves(),
    //       beanstalkPriceContract?.price()
    //     ] as const;

    //     return Promise.all(calls).then((results) => {
    //       console.debug(`[bean/pools/updater] results`, results);
    //       return {
    //         address: pool.address,
    //         pool: {
    //           price: results[1][0].dividedBy(results[1][1]),
    //           total: results[0],
    //           reserves: results[1],
    //           totalCrosses: new BigNumber(-1),
    //         }
    //       } as UpdatePoolPayload;
    //     });
    //   })
    // );
    // dispatch(updateBeanPools(_pools));
   [
    dispatch,
    beanstalkPriceContract
  ]);
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
