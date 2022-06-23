import { beanstalkContract, account } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

const MIN_SOIL = '1';

export const sowBeans = async (
  amount: string,
  claimable: string,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  () => (claimable
    ? beanstalkContract().claimAndSowBeansWithMin(amount, MIN_SOIL, claimable)
    : beanstalkContract().sowBeansWithMin(amount, MIN_SOIL)
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
  () => (claimable
    ? beanstalkContract().claimBuyAndSowBeansWithMin(
        amount,
        buyBeanAmount,
        MIN_SOIL,
        claimable,
        { value: ethAmount }
      )
    : beanstalkContract().buyAndSowBeansWithMin(amount, buyBeanAmount, MIN_SOIL, {
        value: ethAmount,
      })
  ),
  { onResponse }
);

export const harvest = async (
  plots,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  () => beanstalkContract().harvest(plots),
  { onResponse }
);

export const transferPlot = async (
  recipient,
  index,
  start,
  end,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  () => beanstalkContract().transferPlot(account, recipient, index, start, end),
  { onResponse }
);
