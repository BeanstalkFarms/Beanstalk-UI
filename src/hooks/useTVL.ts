import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import Token from 'classes/Token';
import { ZERO_BN } from 'constants/index';
import { BEAN } from 'constants/tokens';
import { AppState } from '~/state';
import useBeansToUSD from './currency/useBeansToUSD';
import useChainConstant from './useChainConstant';

/**
 * Get the USD value of a given token in the Silo.
 */
export default function useTVD() {
  const beansToUSD  = useBeansToUSD();
  const Bean        = useChainConstant(BEAN);
  const siloedBeans = useSelector<AppState, AppState['_beanstalk']['silo']['beans']['total']>((state) => state._beanstalk.silo.beans.total);
  const beanPools   = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);

  return useCallback((_token: Token) => {
    // For Beans, grab the amount in the Silo.
    if (_token === Bean) {
      return beansToUSD(siloedBeans || ZERO_BN);
    }
    // For everything else, use `liquidity` from the price contract.
    return beanPools[_token.address]?.liquidity || ZERO_BN;
  }, [
    beanPools,
    siloedBeans,
    Bean,
    beansToUSD
  ]);
}
