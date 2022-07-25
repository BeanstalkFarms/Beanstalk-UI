import BigNumber from 'bignumber.js';
import { ZERO_BN } from 'constants/index';
import { BEAN } from 'constants/tokens';
import { PodListingFragment, PodOrderFragment } from 'generated/graphql';
import { toTokenUnitsBN } from 'util/index';

/**
 * Cast a Pod Listing from Subgraph form -> Redux form.
 * @param listing The PodListing as returned by the subgraph.
 * @returns Redux form PodListing.
 */
export const castPodListing = (listing: PodListingFragment) : PodListing => {
  const [account, id] = listing.id.split('-'); /// Subgraph returns a conjoined ID.
  const amount = toTokenUnitsBN(listing.totalAmount,   BEAN[1].decimals);  
  const filled = toTokenUnitsBN(listing.filledAmount,  BEAN[1].decimals);
  return {
    id,
    account,
    index:        toTokenUnitsBN(id, BEAN[1].decimals),
    totalAmount:  amount,
    filledAmount: filled,
    remainingAmount: amount.minus(filled),
    maxHarvestableIndex: toTokenUnitsBN(listing.maxHarvestableIndex, BEAN[1].decimals),
    pricePerPod:  toTokenUnitsBN(listing.pricePerPod, BEAN[1].decimals),
    start:        ZERO_BN,
    status:       listing.status as 'active' | 'filled',
    toWallet:     false,
  };
};

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
    status:          order.status as 'active' | 'filled',
  };
};

export type PodListing = {
  /**
   * The ID of the Pod Listing. Equivalent to the `index` with no decimals.
   * `id = BigNumber(index) * 10**6`
   */
  id: string

  /**
   * The address of the Farmer that owns the Listing.
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
   */
  index: BigNumber;

  /**
   * The difference in index of where the listing starts selling pods from and where the plot starts
   *
   */
  start: BigNumber;

  /**
   * Price per Pod, in Beans.
   */
  pricePerPod: BigNumber;

  /**
   * The absolute position in line at which this listing expires.
   */
  maxHarvestableIndex: BigNumber;

  /**
   * 
   */
  toWallet: boolean;

  // -- Amounts

  /**
   * The total number of Pods to sell from the Plot.
   */
  totalAmount: BigNumber;

  /**
   * The number of Pods left to sell.
   *
   * `remainingAmount = totalAmount - filledAmount`
   * `totalAmount > remainingAmount > 0`
   */
  remainingAmount: BigNumber;

  /**
   * The number of Pods that have been bought from this PodListing.
   *
   * `0 < filledAmount < totalAmount`
   */
  filledAmount: BigNumber;

  /**
   * Pod Listing status.
   *
   * FIXME: make this an enum
   */
  status: 'active' | 'filled';
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
   * Pod Order status.
   *
   * FIXME: make this an enum
   */
  status: 'active' | 'filled';
};

export type FarmerMarket = {
  listings: {
    [plotIndex: string]: PodListing;
  };
  orders: {
    [id: string]: PodOrder;
  }
}