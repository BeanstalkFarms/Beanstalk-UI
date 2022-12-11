import BigNumber from 'bignumber.js';
import { ZERO_BN } from '~/constants';
import { BEAN } from '~/constants/tokens';
import { MarketStatus, PodListingFragment, PodOrderFragment } from '~/generated/graphql';
import { FarmToMode } from '~/lib/Beanstalk/Farm';
import { toTokenUnitsBN } from '~/util';

/**
 * Cast a Pod Listing from Subgraph form -> Redux form.
 * @param listing The PodListing as returned by the subgraph.
 * @returns Redux form of PodListing.
 */
export const castPodListing = (listing: PodListingFragment, harvestableIndex: BigNumber) : PodListing => {
  /// NOTE: try to maintain symmetry with subgraph vars here.
  const [account, id]     = listing.id.split('-'); /// Subgraph returns a conjoined ID.
  const index             = toTokenUnitsBN(id, BEAN[1].decimals);
  const amount            = toTokenUnitsBN(listing.amount,      BEAN[1].decimals);  
  const totalAmount       = toTokenUnitsBN(listing.totalAmount, BEAN[1].decimals); 
  const filledAmount      = totalAmount.minus(amount);
  const remainingAmount   = amount;
  return {
    id:                   id,
    account:              account,
    index:                index,
    amount:               amount,
    totalAmount:          totalAmount,
    filledAmount:         filledAmount,
    remainingAmount:      remainingAmount,
    maxHarvestableIndex:  toTokenUnitsBN(listing.maxHarvestableIndex, BEAN[1].decimals),
    pricePerPod:          toTokenUnitsBN(listing.pricePerPod, BEAN[1].decimals),
    start:                toTokenUnitsBN(listing.start, BEAN[1].decimals),
    status:               listing.status as MarketStatus,
    mode:                 listing.mode.toString() as FarmToMode, // FIXME: use numbers instead?
    // @ts-ignore
    minFillAmount:        listing.minFillAmount || ZERO_BN,
    // ---
    placeInLine:          index.minus(harvestableIndex)
  };
};

/**
 * Cast a Pod Order from Subgraph form -> Redux form.
 * @param order The PodOrder as returned by the subgraph.
 * @returns Redux form of PodOrder.
 */
export const castPodOrder = (order: PodOrderFragment) : PodOrder => {
  const amount = toTokenUnitsBN(order.amount,   BEAN[1].decimals);  
  const filled = toTokenUnitsBN(order.filledAmount,  BEAN[1].decimals);
  return {
    id:              order.id,
    account:         order.farmer.id,
    totalAmount:     amount,
    filledAmount:    filled,
    remainingAmount: amount.minus(filled),
    maxPlaceInLine:  toTokenUnitsBN(order.maxPlaceInLine, BEAN[1].decimals),
    pricePerPod:     toTokenUnitsBN(order.pricePerPod, BEAN[1].decimals),
    // @ts-ignore
    minFillAmount:   order.minFillAmount || ZERO_BN,
    status:          order.status as MarketStatus,
  };
};

export type PodListing = {
  /**
   * The ID of the Pod Listing. Equivalent to the `index` with no decimals.
   * @decimals 0
   */
  id: string

  /**
   * The address of the Farmer that owns the Listing.
   * @decimals 0
   */
  account: string;

  /**
   * The absolute index of the listed Plot in the Pod Line.
   *
   * Measured from the front, so the Listing contains all Pods between
   * (index) and (index + totalAmount).
   *
   * An example where the podLine is 50,000 but the index is 150,000:
   *    0         the first Pod issued
   *    100,000   harvestableIndex
   *    150,000   index
   * 
   * @decimals 6
   */
  index: BigNumber;

  /**
   * The difference in index of where the listing starts selling pods from and where the plot starts
   * @decimals 6
   */
  start: BigNumber;

  /**
   * Price per Pod, in Beans.
   * @decimals 6
   */
  pricePerPod: BigNumber;

  /**
   * The absolute position in line at which this listing expires.
   * @decimals 6
   */
  maxHarvestableIndex: BigNumber;

  /**
   * Where Beans are sent when the listing is filled.
   */
  mode: FarmToMode;

  /**
   * The total number of Pods to sell from the Plot.
   * This is the number of Pods that can still be bought.
   * Every time it changes, `index` is updated.
   */
  amount: BigNumber;

  /**
   * The total number of Pods originally intended to be sold.
   * Fixed upon emission of `PodListingCreated`.
   */
  totalAmount: BigNumber;

  /**
   * The number of Pods left to sell.
   *
   * `remainingAmount = amount`
   * `totalAmount > remainingAmount > 0`
   */
  remainingAmount: BigNumber;

  /**
   * The number of Pods that have been bought from this PodListing.
   *
   * `filledAmount = totalAmount - amount`
   * `0 < filledAmount < totalAmount`
   */
  filledAmount: BigNumber;

  /**
   * 
   */
  minFillAmount: BigNumber;
  
  /**
   * Pod Listing status.
   *
   * FIXME: make this an enum
   */
  status: MarketStatus;

  /**
   * 
   */
  placeInLine: BigNumber;
};

export type PodOrder = {
  /**
   * Wallet address
   */
  account: string;

  /**
   * The id of the Pod Order.
   *
   * Computed by hashing the Farmer’s address and the previous block’s hash. In the case of a collisions,
   * Beanstalk will hash the ID until there is no collision.
   */
  id: string;

  /**
   * The price per Pod, in Beans.
   */
  pricePerPod: BigNumber;

  /**
   * The User is willing to buy any Pod that is before maxPlaceInLine at pricePerPod.
   * As the Pod Line moves, this value stays the same because new Pods meet the criteria.
   */
  maxPlaceInLine: BigNumber;

  // -- Amounts

  /**
   * The total number of Pods that can be sold to this PodOrder.
   *
   * FIXME: "ToBuy" naming here; this differs from Listing.
   */
  totalAmount: BigNumber;

  /**
   * The number of Pods left to be sold to this PodOrder.
   *
   * `remainingAmount = totalAmount - filledAmount`
   * `totalAmount > remainingAmount > 0`
   */
  remainingAmount: BigNumber;

  /**
   * The number of Pods that have been sold to this PodOrder.
   *
   * `0 < filledAmount < totalAmount`
   */
  filledAmount: BigNumber;

  /**
   * 
   */
   minFillAmount: BigNumber;
   
  /**
   * Pod Order status.
   *
   * FIXME: make this an enum
   */
  status: MarketStatus;
};

export type FarmerMarket = {
  listings: {
    [plotIndex: string]: PodListing;
  };
  orders: {
    [id: string]: PodOrder;
  }
}
