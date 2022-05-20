import { beanstalkContract } from './index';

export const sunrise = async () => {
  beanstalkContract()
    .sunrise()
    .then((response) => {
      response.wait().then(() => {
        // txCallback();
      });
    });
};
