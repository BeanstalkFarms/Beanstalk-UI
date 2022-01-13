import { beanstalkContract, txCallback } from './index';

export const buyListing = async (index, from, amount, claimable, callback) => {
  (claimable
    ? beanstalkContract().claimBeansAndBuyListing(index, from, amount, claimable)
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

export const listBuyOffer = async (maxPlaceInLine, price, amount, claimable, callback) => {
  (claimable
    ? beanstalkContract().claimBeansAndListBuyOffer(maxPlaceInLine, price, amount, claimable)
    : beanstalkContract().listBuyOffer(maxPlaceInLine, price, amount)
  ).then((response) => {
    callback();
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const buyBeansAndListBuyOffer = async (
  maxPlaceInLine,
  price,
  amount,
  buyBeanAmount,
  ethAmount,
  claimable,
  callback
) => {
  (claimable
    ? beanstalkContract().claimAndBuyBeansAndListBuyOffer(
        maxPlaceInLine,
        price,
        amount,
        buyBeanAmount,
        claimable,
        { value: ethAmount }
      )
    : beanstalkContract().buyBeansAndListBuyOffer(
      maxPlaceInLine,
      price,
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
