import { useCallback, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';

import Pools from 'constants/v2/pools';
import { updateBeanPools, UpdatePoolPayload } from './actions';

export const getPools = async () => Promise.all(
    Pools.all.map((pool) => {
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

export const useGetPools = () => {
  const dispatch = useDispatch();

  // Handlers
  const fetch = useCallback(async () => {
    const _pools = await getPools();
    dispatch(updateBeanPools(_pools));
  }, [dispatch]);
  const clear = useCallback(() => {}, [dispatch]);

  return [fetch, clear];
};

// -- Updater

export default function PoolsUpdater() {
  const [fetch, clear] = useGetPools();

  useEffect(() => {
    fetch();
  }, []);

  return null;
}
