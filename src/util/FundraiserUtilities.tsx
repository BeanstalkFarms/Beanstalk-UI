import { beanstalkContract, txCallback } from './index';

export const fund = async (id, amount, callback, completeCallback) => {
  beanstalkContract()
    .fund(id, amount)
    .then((response) => {
      callback();
      response.wait().then(() => {
        completeCallback();
        txCallback();
      });
    });
};
