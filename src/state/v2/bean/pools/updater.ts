import { useCallback, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';
import { useBeanstalkPriceContract } from 'hooks/useContract';
import { tokenResult } from 'util/TokenUtilities';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP, CRV3, WETH } from 'constants/v2/tokens';
import { getChainConstant } from 'hooks/useChainConstant';
import POOLS from 'constants/v2/pools';
import { SupportedChainId } from 'constants/chains';
import { resetPools, updateBeanPools, UpdatePoolPayload } from './actions';
import { updateBeanPrice } from '../reducer';

export const PRE_EXPLOIT_BEAN_DATA = {
  updateBeanPrice: new BigNumber(1.020270),
  // Mock price contract responses.
  updateBeanPools: [
    {
      address: BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET].address,
      pool: {
        price: new BigNumber(1.020648),
        reserves: [
          tokenResult(BEAN)(new BigNumber(32425202653220)),              // BEAN 0xDC59ac4FeFa32293A95889Dc396682858d52e5Db
          tokenResult(WETH)(new BigNumber(10886690345515907745338)),     // WETH 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
        ],
        deltaB: tokenResult(BEAN)(new BigNumber(-333052664565)),
        supply: tokenResult(BEAN_ETH_UNIV2_LP)(new BigNumber(540894218294675521)),
        liquidity: tokenResult(BEAN)(new BigNumber(66189447135944)),
      }
    },
    {
      address: BEAN_CRV3_LP[SupportedChainId.MAINNET].address,
      pool: {
        price: new BigNumber(1.019926),
        reserves: [
          tokenResult(BEAN)(new BigNumber(35524374509797)),              // BEAN 0xDC59ac4FeFa32293A95889Dc396682858d52e5Db
          tokenResult(CRV3)(new BigNumber(43096623168841692209092388)),  // 3CRV 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490
        ],
        deltaB: tokenResult(BEAN)(new BigNumber(4211106348118)),
        supply: tokenResult(BEAN_CRV3_LP)(new BigNumber(79284313822927052565331157)),
        liquidity: tokenResult(BEAN)(new BigNumber(80220177662670)),
      },
    },
    {
      address: BEAN_LUSD_LP[SupportedChainId.MAINNET].address,
      pool: {
        price: new BigNumber(1.021841),
        reserves: [
          tokenResult(BEAN)(new BigNumber(385963439511)),              // BEAN 0xDC59ac4FeFa32293A95889Dc396682858d52e5Db
          tokenResult(WETH)(new BigNumber(1256954134859338215702038)),     // LUSD 0x5f98805A4E8be255a32880FDeC7F6728C6568bA0
        ],
        deltaB: tokenResult(BEAN)(new BigNumber(499184592127)),
        supply: tokenResult(BEAN_LUSD_LP)(new BigNumber(1637956191657208904972868)),
        liquidity: tokenResult(BEAN)(new BigNumber(1652616150695)),
      }
    }
  ],
};

export const useGetPools = () => {
  const dispatch = useDispatch();
  const [beanstalkPriceContract, chainId] = useBeanstalkPriceContract();

  // Handlers
  const fetch = useCallback(
    async () => {
      try {
        if (beanstalkPriceContract) {
          // TEMP: FIX EXPLOIT
          // ---------------------------------------------------------
          // If we're on MAINNET, use hard-coded pool data from above.
          if (chainId === SupportedChainId.MAINNET) {
            dispatch(updateBeanPools(PRE_EXPLOIT_BEAN_DATA.updateBeanPools));
            dispatch(updateBeanPrice(PRE_EXPLOIT_BEAN_DATA.updateBeanPrice));
            console.debug('[bean/pools/useGetPools] OVERRIDE: using pre-exploit data');
            return;
          }

          console.debug('[bean/pools/useGetPools] FETCH', beanstalkPriceContract.address, chainId);
          const pools = getChainConstant(POOLS, chainId);
          const priceResult = await beanstalkPriceContract.price();
          if (!priceResult) return;

          console.debug('[bean/pools/useGetPools] RESULT: price contract result =', priceResult);

          // Step 2: Get LP token supply data and format as UpdatePoolPayload
          const dataWithSupplyResult : (Promise<UpdatePoolPayload>)[] = [
            ...priceResult.ps.reduce<(Promise<UpdatePoolPayload>)[]>((acc, poolData) => {
              // const poolData = 
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
                      // ---------------------- 
                      // TO HARDCODE ON MAINNET
                      // ----------------------
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
