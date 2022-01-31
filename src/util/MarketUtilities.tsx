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

/**
 * @param index The index of the Plot being listed.
 * @param start The start index within the Plot that the listing starts at.
 * @param pricePerPod The price in Beans that each Pod will be listed for. The price has 6 decimal precision.
 * @param maxHarvestableIndex The amount of total pods that need to be harvestable before the Plot expires.
 * @param amount The amount of Pods that will be contained within the listing.
 * @param toWallet Denotes whether msg.sender wants their Beans paid to their circulating wallet balance or to their claimable balance.
 * @param onResponse 
 * @returns 
 */
export const createPodListing = async (
  index: string,
  start: string,
  pricePerPod: string,
  maxHarvestableIndex: string,
  amount: string,
  toWallet: boolean,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().createPodListing(
    index,
    start,
    amount,
    pricePerPod,
    maxHarvestableIndex,
    toWallet,
  ),
  { onResponse }
);

/**
 * @param index The index of the Plot being canceled.
 * @param onResponse 
 * @returns 
 */
export const cancelPodListing = (
  index: string,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().cancelListing(index),
  { onResponse }
);
