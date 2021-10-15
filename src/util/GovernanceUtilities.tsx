import { beanstalkContract, txCallback } from './index';

export const vote = async (bip, callback) => {
  beanstalkContract()
    .vote(bip)
    .then(response => {
      callback();
      response.wait().then(receipt => {
        txCallback();
      });
    });
};

export const unvote = async (bip, callback) => {
  beanstalkContract()
    .unvote(bip)
    .then(response => {
      callback();
      response.wait().then(receipt => {
        txCallback();
      });
    });
};

export const percentForStalk = (stalk, totalStalk) =>
  stalk.dividedBy(totalStalk).multipliedBy(100).decimalPlaces(2).toNumber();
