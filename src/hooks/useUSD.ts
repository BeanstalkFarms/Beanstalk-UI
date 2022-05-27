import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

/**
 * Convert an amount of a token into BDV.
 */
const useUSD = () => {
  const price = useSelector<AppState, AppState['_bean']['price']>((state) => state._bean.price);
  return useCallback((bdv: BigNumber) => bdv.multipliedBy(price[0]), [price]);
};

export default useUSD;
