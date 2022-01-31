import { beanstalkContract } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

// -- LISTINGS -- //

type CreatePodListingParams = {
  /** The index of the Plot being listed. */
  index: string,
  /** The start index within the Plot that the listing starts at. */
  start: string,
  /** The price in Beans that each Pod will be listed for. The price has 6 decimal precision. */
  pricePerPod: string,
  /** The amount of total pods that need to be harvestable before the Plot expires. */
  maxHarvestableIndex: string,
  /** The amount of Pods that will be contained within the listing. */
  amount: string,
  /** Denotes whether msg.sender wants their Beans paid to their circulating wallet balance or to their claimable balance. */
  toWallet: boolean,
}

export const createPodListing = async (
  params: CreatePodListingParams,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().createPodListing(
    params.index,
    params.start,
    params.amount,
    params.pricePerPod,
    params.maxHarvestableIndex,
    params.toWallet,
  ),
  { onResponse }
);

type CancelPodListingParams = {
  /** The index of the Plot being canceled. */
  index: string,
}

export const cancelPodListing = (
  params: CancelPodListingParams,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().cancelListing(
    params.index
  ),
  { onResponse }
);

type FillPodListingParams = {
  /** The address of the Farmer that owns the Listing. */
  from: string;
  /** The index of the Plot being listed. */
  index: string;
  /** The start index within the Plot that msg.sender is buying from. */
  start: string;
  /** The amount of Beans msg.sender is spending. */
  beanAmount: string;
  /** The price per Pod msg.sender is paying. */
  pricePerPod: string;
  /**  */
  claimable: any, // FIXME
}

export const fillPodListing = async (
  params: FillPodListingParams,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (params.claimable
    ? beanstalkContract().claimAndFillPodListing(
      params.from,
      params.index,
      params.start,
      params.beanAmount,
      params.pricePerPod,
      params.claimable
    )
    : beanstalkContract().fillPodListing(
      params.from,
      params.index,
      params.start,
      params.beanAmount,
      params.pricePerPod,
    )
  ),
  { onResponse }
);

type BuyBeansAndFillPodListingParams = {
  /** The address of the Farmer that owns the Listing. */
  from: string;
  /** The index of the Plot being listed. */
  index: string;
  /** The start index within the Plot that msg.sender is buying from. */
  start: string;
  /** The amount of already owned Beans msg.sender is spending. */
  beanAmount: string;
  /** The amount of Beans to buy with ETH and use as payment */
  buyBeanAmount: string;
  /** The price per Pod msg.sender is paying */
  pricePerPod: string;
  /** Allows Farmers to use claimable and wrapped Beans to purchase the listing */
  claimable: any; // FIXME: should be typeof claimable | null
  /** The maximum amount of Eth to spend buying Beans. msg.value must be attached to the transaction. */
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

type FillPodOrderParams = {
  /** The id of the order being bought */
  id: string;
  /** The index of the plot that is being sold into the Pod Order */
  index: string;
  /** The start index of the Plot that is being sold. */
  start: string;
  /** The max Pod index msg.sender is willing to buy */
  amount: string;
  /** Used to signal whether msg.sender wants their Bean payment to go to their wallet or wrapped balance. */
  toWallet: boolean;
  // finalIndex,
  // sellFromIndex,
  // buyOfferIndex,
  // finalAmount,
}

export const fillPodOrder = async (
  params: FillPodOrderParams,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().fillPodOrder(
    params.id,
    params.index,
    params.start,
    params.amount,
    params.toWallet
  ),
  { onResponse }
);

// -- ORDERS (prev. Buy Offers) -- //

type CreatePodOrderParams = {
  /** The amount of Beans msg.sender will spend up to in the Order */
  beanAmount: string;
  /** The price per Pod msg.sender is willing to pay */
  pricePerPod: string;
  /** The max Pod index msg.sender is willing to buy */
  maxPlaceInLine: string;
  /** Allows Farmers to use claimable and wrapped Beans to use as payment in the Pod Order */
  claimable?: any;
}

export const createPodOrder = async (
  params: CreatePodOrderParams,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (params.claimable
    ? beanstalkContract().claimAndCreatePodOrder(
      params.beanAmount, 
      params.pricePerPod, 
      params.maxPlaceInLine, 
      params.claimable
    )
    : beanstalkContract().createPodOrder(
      params.beanAmount,
      params.pricePerPod,
      params.maxPlaceInLine,
    )
  ),
  { onResponse }
);

type BuyBeansAndCreatePodOrderParams = {
  /** The amount of Beans msg.sender will spend up to in the Order */
  beanAmount: string;
  /** The amount of Beans to buy with ETH and use as payment */
  buyBeanAmount: string;
  /** The price per Pod msg.sender is willing to pay */
  pricePerPod: string;
  /** The max Pod index msg.sender is willing to buy */
  maxPlaceInLine: string;
  /** Allows Farmers to use claimable and wrapped Beans to use as payment in the Pod Order */
  claimable: any;
  /** The maximum amount of Eth to spend buying Beans. msg.value must be attached to the transaction. */
  ethAmount: string;
}

export const buyBeansAndCreatePodOrder = async (
  params: BuyBeansAndCreatePodOrderParams,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  (params.claimable
    ? beanstalkContract().claimBuyBeansAndCreatePodOrder(
        params.beanAmount,
        params.buyBeanAmount,
        params.pricePerPod,
        params.maxPlaceInLine,
        params.claimable,
        { value: params.ethAmount }
      )
    : beanstalkContract().buyBeansAndCreatePodOrder(
      params.beanAmount,
      params.buyBeanAmount,
      params.pricePerPod,
      params.maxPlaceInLine,
      { value: params.ethAmount }
    )
  ),
  { onResponse }
);

type CancelPodOrderParams = {
  /** The index of the Pod order being canceled. */
  index: string;
  /** Whether the remaining Beans in the order should be removed to msg.senders's wallet or wrapped balance. */
  toWallet: boolean;
}

export const cancelPodOrder = (
  params: CancelPodOrderParams,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().cancelPodOrder(
    params.index,
    params.toWallet
  ),
  { onResponse }
);
