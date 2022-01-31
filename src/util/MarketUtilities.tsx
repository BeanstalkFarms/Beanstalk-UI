import { beanstalkContract } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

// FIXME: needs-refactor
export const buyListing = async (
  index: string,
  from: string,
  amount: string,
  claimable: any, // FIXME
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (claimable
    ? beanstalkContract().claimAndBuyListing(index, from, amount, claimable)
    : beanstalkContract().buyListing(index, from, amount)
  ),
  { onResponse }
);

// FIXME: needs-refactor
export const buyBeansAndBuyListing = async (
  index: string,
  from: string,
  amount: string,
  buyBeanAmount: string,
  ethAmount: string,
  claimable: any,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
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
  ),
  { onResponse }
);

// FIXME: needs-refactor
export const sellToBuyOffer = async (
  finalIndex,
  sellFromIndex,
  buyOfferIndex,
  finalAmount,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract()
    .sellToBuyOffer(
      finalIndex,
      sellFromIndex,
      buyOfferIndex,
      finalAmount
    ),
  { onResponse }
);

// -- ORDERS (prev. Buy Offers) -- //

// FIXME: needs-refactor
export const listBuyOffer = async (
  maxPlaceInLine,
  price,
  amount,
  claimable,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (claimable
    ? beanstalkContract().claimBeansAndListBuyOffer(maxPlaceInLine, price, amount, claimable)
    : beanstalkContract().listBuyOffer(maxPlaceInLine, price, amount)
  ),
  { onResponse }
);

// FIXME: needs-refactor
export const buyBeansAndListBuyOffer = async (
  maxPlaceInLine,
  price,
  amount,
  buyBeanAmount,
  ethAmount,
  claimable,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
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
  ),
  { onResponse }
);

// FIXME: needs-refactor
export const cancelBuyOffer = (
  index: string,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().cancelBuyOffer(index),
  { onResponse }
);


// -- LISTINGS -- //

// FIXME: needs-refactor
export const listPlot = async (
  index: string,
  pricePerPod: string,
  expiry: string,
  amount: string,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().listPlot(
    index,
    pricePerPod,
    expiry,
    amount,
  ),
  { onResponse }
);

// FIXME: needs-refactor
export const cancelListing = (
  index: string,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().cancelListing(index),
  { onResponse }
);