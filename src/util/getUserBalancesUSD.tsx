import BigNumber from 'bignumber.js';
import { poolForLP } from './UniswapUtilities';
import { AppState } from '../state';

/**
 * Calculate the amount each asset the user controls. This includes all token
 * lifecycle states.
 *  - Bean
 *  - Bean:ETH
 *  - Bean:3CRV
 * 
 * For each token this includes tokens at the following lifecycle states:
 *  1. "circulating" (in my wallet) -> tokenBalance
 *  2. "siloed" (deposited in the silo) -> tokenSiloBalance
 *  3. "transit" (withdrawn but withdraw period hasn't passed) -> tokenTransitBalance
 *  4. "receivableBalance" (withdrawn and ready to move to wallet) -> tokenReceivableBalance
 * 
 * For Beans we also include the following additional measurements:
 *  - "beanWrappedBalance" (...)
 *  - "harvestablePodBalance" (...)
 * 
 * FIXME: we'll want to abstract this across tokens. Right now this is duplicated.
 */
export function getUserBalancesUSD(
  userBalanceState: AppState['userBalance'],
  priceState: AppState['prices'],
  totalBalanceState: AppState['totalBalance']
) {
  const poolForLPRatio = (amount: BigNumber) => poolForLP(amount, priceState.beanReserve, priceState.ethReserve, totalBalanceState.totalLP);
  const poolForCurveRatio = (amount: BigNumber) => poolForLP(amount, priceState.beanCrv3Reserve, priceState.crv3Reserve, totalBalanceState.totalCrv3);

  // Sum the amount of each token the user currently holds.
  // For each token, we add up the four lifecycle states.
  // For Beans, we also include `beanWrappedBalance` and `harvestablePodBalance`.
  const userBeans = userBalanceState.beanBalance
    .plus(userBalanceState.beanSiloBalance)
    .plus(userBalanceState.beanTransitBalance)
    .plus(userBalanceState.beanReceivableBalance)
    .plus(userBalanceState.beanWrappedBalance)
    .plus(userBalanceState.harvestablePodBalance);
  const userLP = userBalanceState.lpBalance
    .plus(userBalanceState.lpSiloBalance)
    .plus(userBalanceState.lpTransitBalance)
    .plus(userBalanceState.lpReceivableBalance);
  const userCurve = userBalanceState.curveBalance
    .plus(userBalanceState.curveSiloBalance)
    .plus(userBalanceState.curveTransitBalance)
    .plus(userBalanceState.curveReceivableBalance);

  // Get pool tuples
  const userBeansAndEth = poolForLPRatio(userLP);
  const userBeansAndCrv3 = poolForCurveRatio(userCurve);

  // "LP Beans" and "Curve beans" convert Uniswap/Curve LP holdings
  // into Bean-denominated value.
  const userLPBeans = userBeansAndEth[0].multipliedBy(2);
  const userCurveBeans = (
    userBeansAndCrv3[0]
      .multipliedBy(priceState.beanCrv3Price)
      .plus(userBeansAndCrv3[1])
  );

  // Calculate USD value for each Bean-valued item.
  const userBeanBalanceUSD  = userBeans.multipliedBy(priceState.beanPrice);
  const userLPBalanceUSD    = userLPBeans.multipliedBy(priceState.beanPrice);
  const userCurveBalanceUSD = userCurveBeans.multipliedBy(priceState.curveVirtualPrice);

  return {
    Bean: userBeanBalanceUSD,
    'Bean:ETH': userLPBalanceUSD,
    'Bean:3CRV': userCurveBalanceUSD
  };
}

export function sumBalances(valueByToken) {
  return (
    valueByToken.Bean
      .plus(valueByToken['Bean:ETH'])
      .plus(valueByToken['Bean:3CRV'])
  );
}
