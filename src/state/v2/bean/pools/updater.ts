import { useCallback, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';

import { useBeanstalkPriceContract } from 'hooks/useContract';
import { tokenResult } from 'util/LedgerUtilities2';
import { BEAN, ERC20Tokens } from 'constants/v2/tokens';
import useTokenList from 'hooks/useTokenList';
import usePools from 'hooks/usePools';
import { updateBeanPools, UpdatePoolPayload } from './actions';
import { updateBeanPrice } from '../reducer';

export const useGetPools = () => {
  const dispatch = useDispatch();
  const beanstalkPriceContract = useBeanstalkPriceContract();
  const tokens = useTokenList(ERC20Tokens);
  const pools = usePools();

  // Handlers
  const fetch = useCallback(
    async () => {
      if (beanstalkPriceContract) {
        const result = await beanstalkPriceContract?.price();
        if (!result) return;
        console.debug('[bean/pools/updater] result', result, tokens);
        const beanPools = result.ps.reduce<(Promise<UpdatePoolPayload>)[]>((acc, poolData) => {
          const address = poolData.pool;
          // If a new pool is added to the Pools contract before it's
          // configured in the frontend, this function would throw an error.
          // Thus, we only process the pool's data if we have it configured.
          if (pools[address]) {
            acc.push(
              pools[address].lpToken.getTotalSupply().then((supply) => ({
                address: poolData.pool,
                pool: {
                  price: tokenResult(BEAN)(poolData.price.toString()),
                  reserves: [
                    tokenResult(tokens[poolData.tokens[0]])(poolData.balances[0]),
                    tokenResult(tokens[poolData.tokens[1]])(poolData.balances[1]),
                  ],
                  deltaB: tokenResult(BEAN)(poolData.deltaB.toString()),
                  supply: tokenResult(pools[address].lpToken)(supply.toString()),
                  liquidity: tokenResult(BEAN)(poolData.liquidity.toString()),
                  totalCrosses: new BigNumber(0),
                },
              }))
            );
          }
          return acc;
        }, []);
        dispatch(updateBeanPools(await Promise.all(beanPools)));
        dispatch(updateBeanPrice(tokenResult(BEAN)(result.price.toString())));
      }
    },
    [
      dispatch,
      beanstalkPriceContract,
      tokens,
      pools
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
