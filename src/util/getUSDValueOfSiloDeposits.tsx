import BigNumber from "bignumber.js";
import { poolForLP } from "./UniswapUtilities";
import { AppState } from "../state";

// Takes in userBalanceState, priceState, and totalBalanceState
// and returns the total USD price of user's token deposits.
export function getUSDValueOfSiloDeposits(
    userBalanceState: AppState['userBalance'],
    priceState: AppState['prices'],
    totalBalanceState: AppState['totalBalance']
) {
  const poolForLPRatio = (amount: BigNumber) => poolForLP(amount, priceState.beanReserve, priceState.ethReserve, totalBalanceState.totalLP);
  const poolForCurveRatio = (amount: BigNumber) => poolForLP(amount, priceState.beanCrv3Reserve, priceState.crv3Reserve, totalBalanceState.totalCrv3);

  const userBeans = userBalanceState.beanBalance
    .plus(userBalanceState.beanSiloBalance)
    .plus(userBalanceState.beanTransitBalance)
    .plus(userBalanceState.beanWrappedBalance)
    .plus(userBalanceState.beanReceivableBalance)
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

  const userLPBeans = userBeansAndEth[0].multipliedBy(2);
  const userCurveBalanceInDollars = (
    userBeansAndCrv3[0]
    .multipliedBy(priceState.beanCrv3Price)
    .plus(userBeansAndCrv3[1])
  ).multipliedBy(priceState.curveVirtualPrice);

  return { 'Bean': userBeans, 'Bean:ETH': userLPBeans, 'Bean:3CRV': userCurveBalanceInDollars }
}

export function addTotalDeposits(siloDeposits) {
  return new BigNumber(siloDeposits.Bean.toNumber() + siloDeposits["Bean:ETH"].toNumber() + siloDeposits["Bean:3CRV"].toNumber())
}
