import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { BEAN, BEAN_ETH_UNIV2_LP } from 'constants/v2/tokens';
import Token from 'classes/Token';
import Pool from 'classes/Pool';
import useChainConstant from './useChainConstant';

/**
 * Convert an amount of a token into BDV.
 */
const useBDV = () => {
  const poolState = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const Bean      = useChainConstant(BEAN);
  const BeanEthLP = useChainConstant(BEAN_ETH_UNIV2_LP);
  const getBDV = useCallback((token: Token, amount: BigNumber) => {
    if (token === Bean) return amount;
    if (token === BeanEthLP && poolState[BeanEthLP.address]) {
      // Instantaneous BDV. If I deposit right now, this is the BDV
      // formula called. It gets complicated because for FL resistance
      // a TWAP/etc. is used. Only time we call a BDV function is when
      // I deposit in the Silo. Calculate the BDV of 1 Bean:3crv deposit.
      // There's an onchain function called bdv(). Give it a token addr
      // and an amount.
      // Value of the underlying token can fluctuate above/below the BDV.
      // Working on updating the BDV of deposits.
      // When showing the dollar value of things, we should use the amount of
      // lp token.
      // LP Token to Dollar Value:
      //    In each price function there's a dollar value of liquidity
      //    Divide dollar value of liq by supply of LP token
      const tokens = Pool.poolForLP(
        amount,
        poolState[BeanEthLP.address].reserves[0],
        poolState[BeanEthLP.address].reserves[1],
        poolState[BeanEthLP.address].supply,
      );
      return tokens[0].multipliedBy(2);
    }
    return new BigNumber(0);
  }, [
    poolState,
    Bean,
    BeanEthLP,
  ]);
  return getBDV;
};

export default useBDV;
