import { ContractTransaction, ethers } from 'ethers';
import { beanstalkContract, txCallback, account } from './index';

export const sowBeans = async (
  amount: string,
  claimable: string,
  callback: Function,
  completeCallBack: Function
) => {
  (claimable
    ? beanstalkContract().claimAndSowBeans(amount, claimable)
    : beanstalkContract().sowBeans(amount)
  ).then((response: ContractTransaction) => {
    callback(response.hash);
    response.wait().then(() => {
      completeCallBack();
      txCallback && txCallback();
    });
  });
};

export const buyAndSowBeans = async (
  amount,
  buyBeanAmount,
  ethAmount,
  claimable,
  callback,
  completeCallBack
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
    callback(response.hash);
    response.wait().then(() => {
      completeCallBack();
      txCallback();
    });
  });
};

export const harvest = async (
  plots,
  callback,
  completeCallBack
) => {
  beanstalkContract()
    .harvest(plots)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
};

export const transferPlot = async (
  recipient,
  index,
  start,
  end,
  callback,
  completeCallBack
) => {
  beanstalkContract()
    .transferPlot(account, recipient, index, start, end)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
};
