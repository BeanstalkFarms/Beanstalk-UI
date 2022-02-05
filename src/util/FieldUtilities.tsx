import { beanstalkContract, account } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

export const sowBeans = async (
  amount: string,
  claimable: string,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (claimable
    ? beanstalkContract().claimAndSowBeans(amount, claimable)
    : beanstalkContract().sowBeans(amount)
  ),
  { onResponse }
);

export const buyAndSowBeans = async (
  amount,
  buyBeanAmount,
  ethAmount,
  claimable,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (claimable
    ? beanstalkContract().claimBuyAndSowBeans(
        amount,
        buyBeanAmount,
        claimable,
        { value: ethAmount }
      )
    : beanstalkContract().buyAndSowBeans(amount, buyBeanAmount, {
        value: ethAmount,
      })
  ),
  { onResponse }
);

export const harvest = async (
  plots,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().harvest(plots),
  { onResponse }
);

export const transferPlot = async (
  recipient,
  index,
  start,
  end,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().transferPlot(account, recipient, index, start, end),
  { onResponse }
);
