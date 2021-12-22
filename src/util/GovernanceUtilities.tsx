import { beanstalkContract, txCallback } from './index';

export const vote = async (bip, callback, completeCallback) => {
  beanstalkContract()
    .vote(bip)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallback();
        txCallback();
      });
    });
};

export const unvote = async (bip, callback, completeCallBack) => {
  beanstalkContract()
    .unvote(bip)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
};

export const percentForStalk = (stalk, totalStalk) =>
  stalk.dividedBy(totalStalk).multipliedBy(100).decimalPlaces(2).toNumber();
