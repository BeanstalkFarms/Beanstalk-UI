import BigNumber from 'bignumber.js';

import { account, beanstalkContract } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';
import { poolForLP } from './UniswapUtilities';
import { AppState } from '../state';

// FIXME: this should be auto-gen'd from `siloTokens`.
type DepositValueByToken = {
  Bean: BigNumber;
  'Bean:ETH': BigNumber;
  'Bean:3CRV': BigNumber;
}

// Takes in userBalanceState, priceState, and totalBalanceState
// and returns the total USD price of user's token deposits.
export function getUserSiloDepositsUSD(
  userBalanceState: AppState['userBalance'],
  priceState: AppState['prices'],
  totalBalanceState: AppState['totalBalance']
) : DepositValueByToken {
  const poolForLPRatio = (amount: BigNumber) => poolForLP(amount, priceState.beanReserve, priceState.ethReserve, totalBalanceState.totalLP);
  const poolForCurveRatio = (amount: BigNumber) => poolForLP(amount, priceState.beanCrv3Reserve, priceState.crv3Reserve, totalBalanceState.totalCrv3);

  // Balance of user assets deposited in the Silo.
  // FIXME: abstract this so new assets are automatically summed using
  // a map or something similar. -SC
  // This is the same as `getUserBalancesUSD` but only includes Silo components.
  const userBeans = userBalanceState.beanSiloBalance;
  const userLP = userBalanceState.lpSiloBalance;
  const userCurve = userBalanceState.curveSiloBalance;

  // Get pool tuples
  const userBeansAndEth = poolForLPRatio(userLP);
  const userBeansAndCrv3 = poolForCurveRatio(userCurve);

  const userLPBeans = userBeansAndEth[0].multipliedBy(2);
  const userCurveBeans = (
    userBeansAndCrv3[0]
      .multipliedBy(priceState.beanCrv3Price)
      .plus(userBeansAndCrv3[1])
  );

  //
  const userBeanBalanceUSD  = userBeans.multipliedBy(priceState.beanPrice);
  const userLPBalanceUSD    = userLPBeans.multipliedBy(priceState.beanPrice);
  const userCurveBalanceUSD = userCurveBeans.multipliedBy(priceState.curveVirtualPrice);

  return {
    Bean: userBeanBalanceUSD,
    'Bean:ETH': userLPBalanceUSD,
    'Bean:3CRV': userCurveBalanceUSD
  };
}

export function getTotalSiloDepositsUSD(
  priceState: AppState['prices'],
  totalBalanceState: AppState['totalBalance']
) : DepositValueByToken {
  const poolForLPRatio = (amount: BigNumber) => poolForLP(amount, priceState.beanReserve, priceState.ethReserve, totalBalanceState.totalLP);
  const poolForCurveRatio = (amount: BigNumber) => poolForLP(amount, priceState.beanCrv3Reserve, priceState.crv3Reserve, totalBalanceState.totalCrv3);

  // Balance of user assets deposited in the Silo.
  // FIXME: abstract this so new assets are automatically summed using
  // a map or something similar. -SC
  // This is the same as `getUserBalancesUSD` but only includes Silo components.
  const totalSiloBeans = totalBalanceState.totalSiloBeans;
  const totalSiloLP = totalBalanceState.totalSiloLP;
  const totalSiloCurve = totalBalanceState.totalSiloCurve;

  // Get pool tuples
  const totalBeansAndEth = poolForLPRatio(totalSiloLP);
  const totalBeansAndCrv3 = poolForCurveRatio(totalSiloCurve);

  const totalLPBeans = totalBeansAndEth[0].multipliedBy(2);
  const totalCurveBeans = (
    totalBeansAndCrv3[0]
      .multipliedBy(priceState.beanCrv3Price)
      .plus(totalBeansAndCrv3[1])
  );

  //
  const totalSiloBeansUSD = totalSiloBeans.multipliedBy(priceState.beanPrice);
  const totalSiloLPUSD    = totalLPBeans.multipliedBy(priceState.beanPrice);
  const totalSiloCurveUSD = totalCurveBeans.multipliedBy(priceState.curveVirtualPrice);

  return {
    Bean: totalSiloBeansUSD,
    'Bean:ETH': totalSiloLPUSD,
    'Bean:3CRV': totalSiloCurveUSD
  };
}

export function sumDeposits(siloDeposits: DepositValueByToken) {
  return (
    siloDeposits.Bean
      .plus(siloDeposits['Bean:ETH'])
      .plus(siloDeposits['Bean:3CRV'])
  );
}

// -------------

export const depositBeans = async (
  amount,
  claimable,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (claimable
    ? beanstalkContract().claimAndDepositBeans(amount, claimable)
    : beanstalkContract().depositBeans(amount)
  ),
  { onResponse }
);

export const claimAndWithdrawBeans = async (
  crates,
  amounts,
  claimable,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().claimAndWithdrawBeans(crates, amounts, claimable),
  { onResponse }
);

export const withdrawBeans = async (
  crates,
  amounts,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().withdrawBeans(crates, amounts),
  { onResponse }
);

export const claimBeans = async (
  withdrawals,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().claimBeans(withdrawals),
  { onResponse }
);

export const depositLP = async (
  amount,
  claimable,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (claimable
    ? beanstalkContract().claimAndDepositLP(amount, claimable)
    : beanstalkContract().depositLP(amount)
  ),
  { onResponse }
);

export const addAndDepositLP = async (
  lp: BigNumber,
  buyBeanAmount: BigNumber,
  buyEthAmount: BigNumber,
  ethAmount: BigNumber,
  addLP,
  claimable,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (claimable
    ? beanstalkContract().claimAddAndDepositLP(
        lp,
        buyBeanAmount,
        buyEthAmount,
        addLP,
        claimable,
        { value: ethAmount }
      )
    : beanstalkContract().addAndDepositLP(
        lp,
        buyBeanAmount,
        buyEthAmount,
        addLP,
        { value: ethAmount }
      )
  ),
  { onResponse }
);

export const convertAddAndDepositLP = async (
  lp: BigNumber,
  ethAmount: BigNumber,
  addLP,
  crates,
  amounts,
  claimable,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (claimable
    ? beanstalkContract().claimConvertAddAndDepositLP(
        lp,
        addLP,
        crates,
        amounts,
        claimable,
        { value: ethAmount }
      )
    : beanstalkContract().convertAddAndDepositLP(lp, addLP, crates, amounts, {
        value: ethAmount,
      })
  ),
  { onResponse }
);

export const withdrawLP = async (
  crates,
  amounts,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().withdrawLP(crates, amounts),
  { onResponse }
);

export const claimAndWithdrawLP = async (
  crates,
  amounts,
  claimable,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().claimAndWithdrawLP(crates, amounts, claimable),
  { onResponse }
);

export const removeAndClaimLP = async (
  withdrawals,
  minBeanAmount,
  minEthAmount,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().removeAndClaimLP(withdrawals, minBeanAmount, minEthAmount),
  { onResponse }
);

export const claimLP = async (
  withdrawals,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().claimLP(withdrawals),
  { onResponse }
);

export const claim = async (
  claimable,
  toWallet = false,
  wrappedBeans = '0',
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (wrappedBeans === '0'
    ? beanstalkContract().claim(
      [
        ...claimable, 
        toWallet
      ]
    )
    : beanstalkContract().claimAndUnwrapBeans(
      [
        ...claimable,
        toWallet
      ],
      wrappedBeans
    )
  ),
  { onResponse }
);

export const updateSilo = async (
  // claimable: any, // FIXME
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().updateSilo(account),
  { onResponse }
);

export const buyAndDepositBeans = async (
  amount,
  buyBeanAmount,
  ethAmount,
  claimable,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (claimable
    ? beanstalkContract().claimBuyAndDepositBeans(
        amount,
        buyBeanAmount,
        claimable,
        { value: ethAmount }
      )
    : beanstalkContract().buyAndDepositBeans(amount, buyBeanAmount, {
        value: ethAmount,
      })
  ),
  { onResponse }
);

export const convertDepositedBeans = async (
  beans,
  minLP,
  crates,
  amounts,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().convertDepositedBeans(beans, minLP, crates, amounts),
  { onResponse }
);

export const convertDepositedLP = async (
  lp,
  minBeans,
  crates,
  amounts,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().convertDepositedLP(lp, minBeans, crates, amounts),
  { onResponse }
);
