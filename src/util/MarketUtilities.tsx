import { beanstalkContract } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

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

/**
 * @param from The address of the Farmer that owns the Listing.
 * @param index The index of the Plot being listed.
 * @param start The start index within the Plot that msg.sender is buying from.
 * @param beanAmount The amount of Beans msg.sender is spending.
 * @param claimable The price per Pod msg.sender is paying
 * @param onResponse 
 * @returns 
 */
export const fillPodListing = async (
  from: string,
  index: string,
  start: string,
  beanAmount: string,
  claimable: any, // FIXME
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (claimable
    ? beanstalkContract().claimAndFillPodListing(
      from,
      index,
      start,
      beanAmount,
      claimable
    )
    : beanstalkContract().fillPodListing(
      from,
      index,
      start,
      beanAmount
    )
  ),
  { onResponse }
);

/**
 * @param from 
 * @param index The index of the Plot being listed.
 * @param start The start index within the Plot that msg.sender is buying from.
 * @param beanAmount The amount of already owned Beans msg.sender is spending.
 * @param buyBeanAmount The amount of Beans to buy with ETH and use as payment
 * @param pricePerPod The price per Pod msg.sender is paying
 * @param claimable Allows Farmers to use claimable and wrapped Beans to purchase the listing
 * @param ethAmount The maximum amount of Eth to spend buying Beans. msg.value must be attached to the transaction.
 * @param onResponse 
 * @returns 
 */
type BuyBeansAndFillPodListingParams = {
  /** The address of the Farmer that owns the Listing. */
  from: string;
  index: string;
  start: string;
  beanAmount: string;
  buyBeanAmount: string;
  pricePerPod: string;
  claimable: any; // FIXME: should be typeof claimable | null
  ethAmount: string;
}

export const buyBeansAndFillPodListing = async (
  params: BuyBeansAndFillPodListingParams,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (params.claimable
    ? beanstalkContract().claimBuyBeansAndFillPodListing(
        params.from,
        params.index,
        params.start,
        params.beanAmount,
        params.buyBeanAmount,
        params.pricePerPod,
        params.claimable,
        { value: params.ethAmount }
      )
    : beanstalkContract().buyBeansAndFillPodListing(
      params.from,
      params.index,
      params.start,
      params.beanAmount,
      params.buyBeanAmount,
      params.pricePerPod,
      { value: params.ethAmount }
    )
  ),
  { onResponse }
);