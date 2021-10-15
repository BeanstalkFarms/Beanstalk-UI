import { beanstalkContract, txCallback } from './index';

export const sunrise = async () => {
  beanstalkContract()
    .sunrise()
    .then(response => {
      response.wait().then(receipt => {
        txCallback();
      });
    });
};
