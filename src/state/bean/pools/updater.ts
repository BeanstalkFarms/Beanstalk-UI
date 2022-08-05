import { useCallback, useEffect, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';
import throttle from 'lodash/throttle';
import { useBeanstalkPriceContract } from '~/hooks/useContract';
import { tokenResult, getChainConstant } from '~/util/index';
import { BEAN } from '~/constants/tokens';
import ALL_POOLS from '~/constants/pools';
import { useProvider } from 'wagmi';
import { ERC20__factory } from '~/generated';
import { updateBeanPrice, updateBeanSupply } from '../token/actions';
import { resetPools, updateBeanPools, UpdatePoolPayload } from './actions';

export const useFetchPools = () => {
  const dispatch = useDispatch();
  const [beanstalkPriceContract, chainId] = useBeanstalkPriceContract();
  const provider = useProvider();

  // Handlers
  const _fetch = useCallback(
    async () => {
      try {
        if (beanstalkPriceContract) {
          console.debug('[bean/pools/useGetPools] FETCH', beanstalkPriceContract.address, chainId);
          const Pools = getChainConstant(ALL_POOLS, chainId);
          const Bean  = getChainConstant(BEAN, chainId);
          console.debug('Bean', Bean);
          const [
            priceResult,
            beanSupply,
          ] = await Promise.all([
            beanstalkPriceContract.price(),
            ERC20__factory.connect(Bean.address, provider).totalSupply(), // FIXME
          ]);
          if (!priceResult) return;

          console.debug('[bean/pools/useGetPools] RESULT: price contract result =', priceResult, beanSupply.toString());

          // Step 2: Get LP token supply data and format as UpdatePoolPayload
          const dataWithSupplyResult : (Promise<UpdatePoolPayload>)[] = [
            ...priceResult.ps.reduce<(Promise<UpdatePoolPayload>)[]>((acc, poolData) => {
              // NOTE:
              // The below address must be lower-cased. All internal Pool/Token
              // addresses are case-insensitive and stored as lowercase strings.
              const address = poolData.pool.toLowerCase();
              
              // If a new pool is added to the Pools contract before it's
              // configured in the frontend, this function would throw an error.
              // Thus, we only process the pool's data if we have it configured.
              if (Pools[address]) {
                const POOL = Pools[address];
                acc.push(
                  ERC20__factory.connect(POOL.lpToken.address, provider).totalSupply()
                    .then((supply) => ({
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
                        // Liquidity: always denominated in USD for the price contract
                        liquidity: tokenResult(BEAN)(poolData.liquidity.toString()),
                        // USD value of 1 LP token == liquidity / supply
                        totalCrosses: new BigNumber(0),
                      },
                    }))
                    .catch((err) => {
                      console.debug('[beanstalk/pools/updater] Failed to get LP token supply', POOL.lpToken);
                      console.error(err);
                      throw err;
                    })
                );
              } else {
                console.debug(`[bean/pools/useGetPools] price contract returned data for pool ${address} but it isn't configured, skipping. available pools:`, Pools);
              }
              return acc;
            }, [])
          ];

          console.debug('[bean/pools/useGetPools] RESULT: dataWithSupply =', dataWithSupplyResult);
          
          dispatch(updateBeanPools(await Promise.all(dataWithSupplyResult)));
          dispatch(updateBeanPrice(tokenResult(BEAN)(priceResult.price.toString())));
          dispatch(updateBeanSupply(tokenResult(BEAN)(beanSupply.toString())));
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
      provider
    ]
  );
  const clear = useCallback(() => {
    dispatch(resetPools());
  }, [dispatch]);

  const fetch = useMemo(() => throttle(_fetch, 1000), [_fetch]);

  return [fetch, clear];
};

// ------------------------------------------

const PoolsUpdater = () => {
  const [fetch, clear] = useFetchPools();

  useEffect(() => {
    clear();
    fetch();
  }, [
    fetch,
    clear
  ]);
  
  // useTimedRefresh(fetch, 10000);

  return null;
};

export default PoolsUpdater;
