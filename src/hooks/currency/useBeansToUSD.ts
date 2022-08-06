import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import usePrice from '~/hooks/usePrice';
import { ZERO_BN } from '~/constants';

/**
 * Convert an amount of Beans into USD.
 * Uses the aggregate Bean price.
 */
const useBeansToUSD = () => {
  const price = usePrice();
  return useCallback(
    (bdv: BigNumber) => bdv?.multipliedBy(price) || ZERO_BN,
    [price]
  );
};

export default useBeansToUSD;
