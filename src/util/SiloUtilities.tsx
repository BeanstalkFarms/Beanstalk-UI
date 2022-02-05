import BigNumber from 'bignumber.js';
import { account, beanstalkContract } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

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
    ? beanstalkContract().claim([...claimable, toWallet])
    : beanstalkContract().claimAndUnwrapBeans([...claimable, toWallet], wrappedBeans)),
  { onResponse }
);

export const updateSilo = async (
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
