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

/**
 * Cast a Pod Listing from Subgraph form -> Redux form.
 * @param listing The PodListing as returned by the subgraph.
 * @returns Redux form of PodListing.
 */

export const castPodListing = (
  listing: PodListingFragment,
  harvestableIndex: BigNumber
): PodListing => {
  /// NOTE: try to maintain symmetry with subgraph vars here.
  const [account, id] = listing.id.split('-'); /// Subgraph returns a conjoined ID.
  const index = toTokenUnitsBN(id, BEAN[1].decimals);

  const amount = toTokenUnitsBN(listing.remainingAmount, BEAN[1].decimals);
  const originalAmount = toTokenUnitsBN(
    listing.originalAmount,
    BEAN[1].decimals
  );

  return {
    id: id,
    account: listing.farmer.id || account,
    index: index,
    createdAt: listing?.createdAt || null,

    amount: amount,
    originalAmount: originalAmount,
    filledAmount: toTokenUnitsBN(listing.filledAmount, BEAN[1].decimals),
    remainingAmount: amount, // where is this used?

    maxHarvestableIndex: toTokenUnitsBN(
      listing.maxHarvestableIndex,
      BEAN[1].decimals
    ),
    pricePerPod: toTokenUnitsBN(listing.pricePerPod, BEAN[1].decimals),
    start: toTokenUnitsBN(listing.start, BEAN[1].decimals),
    status: listing.status as MarketStatus,
    mode: listing.mode.toString() as FarmToMode, // FIXME: use numbers instead?

    // @ts-ignore
    minFillAmount: toTokenUnitsBN(listing.minFillAmount || ZERO_BN, BEAN[1].decimals),

    placeInLine: index.minus(harvestableIndex),
    pricingFunction: listing?.pricingFunction ?? null,
    pricingType: (listing?.pricingType || null) as PricingType | null,
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
  const podAmount = new BigNumber(order.podAmount).eq(0)
    ? beanAmount.div(pricePerPod)
    : toTokenUnitsBN(order.podAmount, BEAN[1].decimals);
  // const podAmount = toTokenUnitsBN(
  //   podOrderedAmount,
  //   BEAN[1].decimals
  // );
  const podAmountFilled = toTokenUnitsBN(
    order.podAmountFilled,
    BEAN[1].decimals
  );

  return {
    id: order.id,
    account: order.farmer.id,
    createdAt: order.createdAt,

    totalAmount: podAmount,
    filledAmount: podAmountFilled,
    remainingAmount: podAmount.minus(podAmountFilled),

    maxPlaceInLine: toTokenUnitsBN(order.maxPlaceInLine, BEAN[1].decimals),
    pricePerPod: pricePerPod,

    // @ts-ignore
    minFillAmount: toTokenUnitsBN(order.minFillAmount || ZERO_BN, PODS.decimals),

    status: order.status as MarketStatus,
    pricingFunction: order?.pricingFunction ?? null,
    pricingType: (order?.pricingType || null) as PricingType | null,
  };
};

export type PodListing = {
  /**
   * The ID of the Pod Listing. Equivalent to the `index` with no decimals.
   * @decimals 0
   */
  id: string;

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

  /**
   *
   */
  minFillAmount: BigNumber;

  /**
   * Pod Listing status.
   */
  status: MarketStatus;

  /**
   *
   */
  placeInLine: BigNumber;

  /**
   *
   */
  pricingFunction: string | null;

  /**
   *
   */
  pricingType: PricingType | undefined | null;

  /**
   * approximate timestamp in which the listing was created
   * optional b/c it is only available from the subgraph
   */
  createdAt?: string;
};

export enum PricingType {
  FIXED = 0,
  DYNAMIC = 1,
}

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

  /**
   * Market-V2 pricing function
   */
  pricingFunction: string | null;

  /**
   * 0 => FIXED
   * 1 => DYNAMIC
   * null => PodMarket-V1 didn't have price type
   */
  pricingType: PricingType | undefined | null;

  /**
   * approximate timestamp in which the order was created
   * optional b/c it is only available from the subgraph
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
