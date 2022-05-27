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
