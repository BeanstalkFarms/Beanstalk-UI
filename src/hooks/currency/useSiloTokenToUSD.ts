import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { ZERO_BN } from 'constants/index';
import { BEAN } from 'constants/tokens';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import useBeansToUSD from './useBeansToUSD';
import useChainConstant from '../useChainConstant';

/**
 * FIXME: this function is being called very frequently
 */
const useSiloTokenToUSD = () => {
  const beansToUSD  = useBeansToUSD();
  const Bean        = useChainConstant(BEAN);
  const beanPools   = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  
  return useCallback((_token: Token, _amount: BigNumber) => {
    if (!_amount) return ZERO_BN;

    /// For Beans, use the aggregate Bean price.
    if (_token === Bean) return beansToUSD(_amount);
    
    /// For everything else, use the value of the LP token via the beanPool liquidity/supply ratio.
    /// FIXME: the price contract provides this directly now to save a calculation on the frontend.
    const pool = beanPools[_token.address];
    if (!pool || !pool?.liquidity || !pool?.supply) return ZERO_BN;
    return _amount.div(pool.supply).times(pool.liquidity);
  }, [Bean, beanPools, beansToUSD]);
};

export default useSiloTokenToUSD;
