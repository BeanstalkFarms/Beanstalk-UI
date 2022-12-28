import BigNumber from 'bignumber.js';
import { ZERO_BN } from '~/constants';
import { BEAN, PODS } from '~/constants/tokens';
import {
  MarketStatus,
  PodListingFragment,
  PodOrderFragment,
} from '~/generated/graphql';
import { FarmToMode } from '~/lib/Beanstalk/Farm';
import { toTokenUnitsBN } from '~/util';

export enum PricingType {
  FIXED = 0,
  DYNAMIC = 1,
}

/**
 * Cast a Pod Listing from Subgraph form -> Redux form.
 * @param listing The PodListing as returned by the subgraph.
 * @returns Redux form of PodListing.
 */
export const castPodListing = (
  listing: PodListingFragment,
  harvestableIndex: BigNumber
): PodListing => {
  const [account, id] = listing.id.split('-'); // Subgraph returns a conjoined ID
  const index = toTokenUnitsBN(id, BEAN[1].decimals);
  const remainingAmount = toTokenUnitsBN(listing.remainingAmount, BEAN[1].decimals);
  const originalAmount = toTokenUnitsBN(listing.originalAmount, BEAN[1].decimals);

  return {
    // Identifiers
    id: id,
    account: listing.farmer.id || account,
    
    // Configuration
    index: index,
    start: toTokenUnitsBN(listing.start, BEAN[1].decimals),
    mode: listing.mode.toString() as FarmToMode, // FIXME: use numbers instead?
    
    // Pricing
    pricingType: (listing?.pricingType || null) as PricingType | null,
    pricePerPod: toTokenUnitsBN(listing.pricePerPod, BEAN[1].decimals), // if pricingTyped == FIXED
    pricingFunction: listing?.pricingFunction ?? null, // if pricingTyped == DYNAMIC
    
    // Constraints
    maxHarvestableIndex: toTokenUnitsBN(listing.maxHarvestableIndex, BEAN[1].decimals),
    minFillAmount: toTokenUnitsBN(listing.minFillAmount || ZERO_BN, BEAN[1].decimals),

    // Amounts
    // amount: remainingAmount,
    originalAmount: originalAmount,
    filledAmount: toTokenUnitsBN(listing.filledAmount, BEAN[1].decimals),
    remainingAmount: remainingAmount, // where is this used?
    
    // Metadata
    status: listing.status as MarketStatus,
    createdAt: listing?.createdAt || null,

    // Computed
    placeInLine: index.minus(harvestableIndex),
  };
};

/**
 * Cast a Pod Order from Subgraph form -> Redux form.
 * @param order The PodOrder as returned by the subgraph.
 * @returns Redux form of PodOrder.
 */
export const castPodOrder = (order: PodOrderFragment): PodOrder => {
  const pricePerPod = toTokenUnitsBN(order.pricePerPod, BEAN[1].decimals);
  const beanAmount = toTokenUnitsBN(order.beanAmount, BEAN[1].decimals);
  const podAmount = (
    new BigNumber(order.podAmount).eq(0)
      ? beanAmount.div(pricePerPod)
      : toTokenUnitsBN(order.podAmount, BEAN[1].decimals)
  );
  const podAmountFilled = toTokenUnitsBN(
    order.podAmountFilled,
    BEAN[1].decimals
  );

  return {
    // Identifiers
    id: order.id,
    account: order.farmer.id,

    // Pricing
    pricingType: (order?.pricingType || null) as PricingType | null, // if pricingTyped == FIXED
    pricingFunction: order?.pricingFunction ?? null,  // if pricingTyped == DYNAMIC
    pricePerPod: pricePerPod,

    // Constraints
    maxPlaceInLine: toTokenUnitsBN(order.maxPlaceInLine, BEAN[1].decimals),
    minFillAmount: toTokenUnitsBN(order.minFillAmount || ZERO_BN, PODS.decimals),

    // Amounts
    totalAmount: podAmount,
    filledAmount: podAmountFilled,
    remainingAmount: podAmount.minus(podAmountFilled),

    // Metadata
    status: order.status as MarketStatus,
    createdAt: order.createdAt,
  };
};

export type PodListing = {
  /// ///////////// Identifiers ////////////////

  /**
   * The ID of the Pod Listing. Equivalent to the `index` with no decimals.
   */
  id: string;

  /**
   * The address of the Farmer that owns the Listing.
   */
  account: string;

  /// ///////////// Configuration ////////////////

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
   * Where Beans are sent when the listing is filled.
   */
  mode: FarmToMode;

  /// ///////////// Pricing ////////////////

  /**
   *
   */
  pricingType: PricingType | undefined | null;

  /**
   *
   */
  pricingFunction: string | null;

  /**
   * Price per Pod, in Beans.
   * @decimals 6
   */
  pricePerPod: BigNumber;

  /// ///////////// Constraints ////////////////

  /**
   * The absolute position in line at which this listing expires.
   * @decimals 6
   */
  maxHarvestableIndex: BigNumber;

  /**
   *
   */
  minFillAmount: BigNumber;

  /// ///////////// Amounts ////////////////

  /**
   * The total number of Pods to sell from the Plot.
   * This is the number of Pods that can still be bought.
   * Every time it changes, `index` is updated.
   */
  // amount: BigNumber;

  /**
   * The total number of Pods originally intended to be sold.
   * Fixed upon emission of `PodListingCreated`.
   */
  originalAmount: BigNumber;

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

  /// ///////////// Metadata ////////////////

  /**
   * Pod Listing status.
   */
  status: MarketStatus;

  /**
   * approximate timestamp in which the listing was created
   * optional b/c it is only available from the subgraph
   */
  createdAt?: string;

  /// ///////////// Computed ////////////////

  /**
   * Computed value of `index - harvestableIndex` for each Listing.
   */
  placeInLine: BigNumber;
};

export type PodOrder = {
  /// ///////////// Identifiers ////////////////

  /**
   * The id of the Pod Order.
   *
   * Computed by hashing the Farmer’s address and the previous block’s hash. In the case of a collisions,
   * Beanstalk will hash the ID until there is no collision.
   */
  id: string;

  /**
   * Wallet address that created the Order.
   */
  account: string;

  /// ///////////// Pricing ////////////////

  /**
   * 0 => FIXED, use pricePerPod
   * 1 => DYNAMIC, use pricingFunction
   * null => PodMarket-V1 didn't have price type
   */
  pricingType: PricingType | undefined | null;

  /**
   * The price per Pod, in Beans.
   */
  pricePerPod: BigNumber;

  /**
   * Market-V2 pricing function
   */
  pricingFunction: string | null;

  /// ///////////// Constraints ////////////////

  /**
   * The User is willing to buy any Pod that is before maxPlaceInLine at pricePerPod.
   * As the Pod Line moves, this value stays the same because new Pods meet the criteria.
   */
  maxPlaceInLine: BigNumber;

  /**
   * The minimum number of Pods that must be sold to this PodOrder for a 
   * transaction to be considered valid.
   */
  minFillAmount: BigNumber;

  /// ///////////// Amounts ////////////////

  /**
   * The total number of Pods that can be sold to this PodOrder at 
   * the moment of order creation.
   */
  totalAmount: BigNumber;

  /**
   * The number of Pods left to be sold to this PodOrder.
   * `remainingAmount = totalAmount - filledAmount`
   * `totalAmount > remainingAmount > 0`
   */
  remainingAmount: BigNumber;

  /**
   * The number of Pods that have been sold to this PodOrder.
   * `0 < filledAmount < totalAmount`
   */
  filledAmount: BigNumber;

  /// ///////////// Metadata ////////////////

  /**
   * Pod Order status.
   */
  status: MarketStatus;

  /**
   * Timestamp at which the order was created.
   * Optional b/c it is only available from the subgraph
   */
  createdAt?: string;
};

export type FarmerMarket = {
  listings: {
    [plotIndex: string]: PodListing;
  };
  orders: {
    [id: string]: PodOrder;
  };
};
