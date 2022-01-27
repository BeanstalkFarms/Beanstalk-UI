import { beanstalkContract } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

/**
 *
 * @param index (string) index of the listing to buy
 * @param from (string) wallet address that issued the listing
 * @param amount (string) amount of Pods to buy from listing.
 * @param claimable ?
 * @param callback callback after response
 */
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

/**
 *
 * @param index
 * @param from
 * @param amount
 * @param buyBeanAmount
 * @param ethAmount
 * @param claimable
 * @param onResponse
 * @returns
 */
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

/**
 *
 * @param maxPlaceInLine
 * @param price
 * @param amount
 * @param claimable
 * @param onResponse
 * @returns
 */
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

/**
 *
 * @param maxPlaceInLine
 * @param price
 * @param amount
 * @param buyBeanAmount
 * @param ethAmount
 * @param claimable
 * @param onResponse
 * @returns
 */
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

/**
 *
 * @param finalIndex
 * @param sellFromIndex
 * @param buyOfferIndex
 * @param finalAmount
 * @param onResponse
 * @returns
 */
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

export const cancelListing = (
  index: string,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().cancelListing(index),
  { onResponse }
);

export const cancelBuyOffer = (
  index: string,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().cancelBuyOffer(index),
  { onResponse }
);
