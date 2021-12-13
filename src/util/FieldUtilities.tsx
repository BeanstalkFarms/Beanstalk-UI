import { beanstalkContract, txCallback } from './index';

export const sowBeans = async (amount, claimable, callback) => {
  (claimable
    ? beanstalkContract().claimAndSowBeans(amount, claimable)
    : beanstalkContract().sowBeans(amount)
  ).then((response) => {
    callback();
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const buyAndSowBeans = async (
  amount,
  buyBeanAmount,
  ethAmount,
  claimable,
  callback
) => {
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
  ).then((response) => {
    callback();
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const harvest = async (plots, callback) => {
  beanstalkContract()
    .harvest(plots)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const transferPlot = async (
  recipient,
  index,
  start,
  end,
  account,
  callback
) => {
  beanstalkContract()
    .transferPlot(account, recipient, index, start, end)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};
