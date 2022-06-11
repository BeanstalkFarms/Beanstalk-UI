import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { ZERO_BN } from 'constants/index';

/**
 * Convert an amount of Beans into USD.
 * Uses the aggregate Bean price.
 */
const useBeansToUSD = () => {
  const price = useSelector<AppState, AppState['_bean']['token']['price']>((state) => state._bean.token.price);
  return useCallback(
    (bdv: BigNumber) => bdv?.multipliedBy(price) || ZERO_BN,
    [price]
  );
};

export default useBeansToUSD;
