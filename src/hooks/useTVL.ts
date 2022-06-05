import Token from 'classes/Token';
import { zeroBN } from 'constants/index';
import { BEAN } from 'constants/tokens';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import useBeansToUSD from './useBeansToUSD';
import useChainConstant from './useChainConstant';

export const useTVL = () => {
  const beansToUSD = useBeansToUSD();
  const Bean = useChainConstant(BEAN);
  const siloedBeans = useSelector<AppState, AppState['_beanstalk']['silo']['beans']['total']>((state) => state._beanstalk.silo.beans.total);
  const beanPools = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);

  return useCallback((_token: Token) => {
    // For Beans, grab the amount in the Silo.
    if (_token === Bean) {
      return beansToUSD(siloedBeans || zeroBN);
    }
    // For everything else, use `liquidity` from the price contract.
    return beanPools[_token.address]?.liquidity || zeroBN;
  }, [
    beanPools,
    siloedBeans,
    Bean,
    beansToUSD
  ]);
};
