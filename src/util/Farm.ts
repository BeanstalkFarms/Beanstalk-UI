import BigNumber from 'bignumber.js';
import { ZERO_BN } from 'constants/index';
import { FarmFromMode } from 'lib/Beanstalk/Farm';
import { Balance } from 'state/farmer/balances';

/**
 * Gas minimization strategy:
 *      if (amountIn <= internal)      return INTERNAL
 *      else if (amountIn <= external) return EXTERNAL
 *      else                           return INTERNAL_EXTERNAL
 * 
 * Farm assets strategy:
 *      always use some internal if it exists
 *      then use external
 * 
 * @param amountIn 
 * @param balance 
 * @returns 
 */
export const optimizeFromMode = (
  amountIn: BigNumber,
  balance: Balance,
) : FarmFromMode => {
  const { internal, external, total } = balance;
  if (amountIn.gt(total))     throw new Error('Amount in is greater than total balance. INTERNAL_EXTERNAL_TOLERANT not yet supported.');
  if (amountIn.lte(internal)) return FarmFromMode.INTERNAL;
  if (amountIn.lte(external)) return FarmFromMode.EXTERNAL;
  return FarmFromMode.INTERNAL_EXTERNAL;
};

/**
 * 
 */
export const combineBalances = (
  ...balances: Balance[]
) => [...balances].reduce((prev, curr) => {
  prev.internal = prev.internal.plus(curr.internal);
  prev.external = prev.external.plus(curr.external);
  prev.total    = prev.total.plus(curr.total);
  return prev;
}, {
  internal: ZERO_BN,
  external: ZERO_BN,
  total:    ZERO_BN,
});
