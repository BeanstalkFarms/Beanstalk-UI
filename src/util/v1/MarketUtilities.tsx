import { beanstalkContract } from '../index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

// -- LISTINGS -- //

// FIXME: this is ListingStruct without account, since account is implied when creating
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
  beanstalkContract().cancelPodListing(
    params.index
  ),
  { onResponse }
);

type ListingStruct = {
  account: string;
  index: string;
  start: string;
  amount: string;
  pricePerPod: string;
  maxHarvestableIndex: string;
  toWallet: boolean;
}

type FillPodListingParams = {
  /** listing struct. */
  listing: ListingStruct;
  /** The amount of Beans msg.sender is spending. */
  beanAmount: string;
  /**  */
  claimable: any, // FIXME
}

export const fillPodListing = async (
  params: FillPodListingParams,
  onResponse: TxnCallbacks['onResponse']
) => {
  // Unpack the params object into the correct order explicitly.
  const l = [
    params.listing.account,
    params.listing.index,
    params.listing.start,
    params.listing.amount,
    params.listing.pricePerPod,
    params.listing.maxHarvestableIndex,
    params.listing.toWallet,
  ];
  return handleCallbacks(
    (params.claimable
      ? beanstalkContract().claimAndFillPodListing(
        l,
        params.beanAmount,
        params.claimable
      )
      : beanstalkContract().fillPodListing(
        l,
        params.beanAmount,
      )
    ),
    { onResponse }
  );
};

type BuyBeansAndFillPodListingParams = {
  /** Listing struct. */
  listing: ListingStruct;
  /** The amount of already owned Beans msg.sender is spending. */
  beanAmount: string;
  /** The amount of Beans to buy with ETH and use as payment */
  buyBeanAmount: string;
  /** Allows Farmers to use claimable and wrapped Beans to purchase the listing */
  // FIXME: should be typeof claimable | null
  claimable: any; 
  /** The maximum amount of Eth to spend buying Beans. msg.value must be attached to the transaction. */
  ethAmount: string;
}

/**
 * Buy Beans and then purchase Pods from the Market.
 */
export const buyBeansAndFillPodListing = async (
  params: BuyBeansAndFillPodListingParams,
  onResponse: TxnCallbacks['onResponse']
) => {
  // Unpack the params object into the correct order explicitly.
  const l = [
    params.listing.account,
    params.listing.index,
    params.listing.start,
    params.listing.amount,
    params.listing.pricePerPod,
    params.listing.maxHarvestableIndex,
    params.listing.toWallet,
  ];
  return handleCallbacks(
    (params.claimable
      ? beanstalkContract().claimBuyBeansAndFillPodListing(
        l,
        params.beanAmount,
        params.buyBeanAmount,
        params.claimable,
        { value: params.ethAmount } // Not defined in function, but required for swap.
      )
      : beanstalkContract().buyBeansAndFillPodListing(
        l,
        params.beanAmount,
        params.buyBeanAmount,
        { value: params.ethAmount } // Not defined in function, but required for swap.
      )
    ),
    { onResponse }
  );
};

// -- ORDERS (prev. Buy Offers) -- //

// FIXME: this is the contract-level Order struct which overlaps with but differs
// from the Order type used to maintain state on the frontend. We should rename
// or prefix one or the other for clarity. For now I'll use the word "struct" to
// denote matching Solidity types. see `struct Order` in contract.
type OrderStruct = {
  account: string;
  pricePerPod: string;
  maxPlaceInLine: string;
}

type FillPodOrderParams = {
  /** The Order struct of the order being bought */
  order: OrderStruct;
  /** The index of the plot that is being sold into the Pod Order */
  index: string;
  /** The start index of the Plot that is being sold. */
  start: string;
  /** The max Pod index msg.sender is willing to buy */
  amount: string;
  /** Used to signal whether msg.sender wants their Bean payment to go to their wallet or wrapped balance. */
  toWallet: boolean;
}

export const fillPodOrder = async (
  params: FillPodOrderParams,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().fillPodOrder(
    [
      params.order.account,
      params.order.pricePerPod,
      params.order.maxPlaceInLine,
    ],
    params.index,
    params.start,
    params.amount,
    params.toWallet
  ),
  { onResponse }
);

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
  /** The price per Pod msg.sender is willing to pay */
  pricePerPod: string;
  /** The max Pod index msg.sender is willing to buy */
  maxPlaceInLine: string;
  /** Whether the remaining Beans in the order should be removed to msg.senders's wallet or wrapped balance. */
  toWallet: boolean;
}

export const cancelPodOrder = (
  params: CancelPodOrderParams,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().cancelPodOrder(
    params.pricePerPod,
    params.maxPlaceInLine,
    params.toWallet
  ),
  { onResponse }
);