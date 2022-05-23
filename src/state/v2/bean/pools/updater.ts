import { useCallback, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';

import Pools from 'constants/v2/pools';
import usePools from 'hooks/usePools';
import { updateBeanPools, UpdatePoolPayload } from './actions';

export const useGetPools = () => {
  const dispatch = useDispatch();
  const pools = usePools();

  // Handlers
  const fetch = useCallback(async () => {
    const _pools = await Promise.all(
      Object.values(pools).map((pool) => {
        const calls = [
          pool.lpToken.getTotalSupply(),
          pool.getReserves(),
        ] as const;
        return Promise.all(calls).then((results) => ({
          address: pool.address,
          pool: {
            price: results[1][0].dividedBy(results[1][1]),
            total: results[0],
            reserves: results[1],
            totalCrosses: new BigNumber(-1),
          }
        } as UpdatePoolPayload));
      })
    );
    dispatch(updateBeanPools(_pools));
  }, [
    dispatch,
    pools,
  ]);
  const clear = useCallback(() => {}, []);

  return [fetch, clear];
};

// -- Updater

export default function PoolsUpdater() {
  const [fetch, clear] = useGetPools();

  useEffect(() => {
    fetch();
  }, [fetch]);

  return null;
}
