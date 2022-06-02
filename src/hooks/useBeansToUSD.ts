import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { zeroBN } from 'constants/index';

/**
 * Convert an amount of Beans into USD.
 */
const useBeansToUSD = () => {
  const price = useSelector<AppState, AppState['_bean']['token']['price']>((state) => state._bean.token.price);
  return useCallback(
    (bdv: BigNumber) => bdv?.multipliedBy(price) || zeroBN,
    [price]
  );
};

export default useBeansToUSD;
