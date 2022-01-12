import { beanstalkContract, txCallback } from './index';

export const buyListing = async (index, from, amount, claimable, callback) => {
  console.log(index);
  console.log(from);
  console.log(amount);
  console.log(claimable);
  (claimable
    ? beanstalkContract().claimAndBuyListing(index, from, amount, claimable)
    : beanstalkContract().buyListing(index, from, amount)
  ).then((response) => {
    callback();
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const buyBeansAndBuyListing = async (
  index,
  from,
  amount,
  buyBeanAmount,
  ethAmount,
  claimable,
  callback
) => {
  (claimable
    ? beanstalkContract().claimAndBuyBeansAndBuyListing(
        index,
        from,
        amount,
        buyBeanAmount,
        claimable,
        { value: ethAmount }
      )
    : beanstalkContract().buyBeansAndBuyListing(
      index,
      from,
      amount,
      buyBeanAmount,
      { value: ethAmount }
    )
  ).then((response) => {
    callback();
    response.wait().then(() => {
      txCallback();
    });
  });
};
