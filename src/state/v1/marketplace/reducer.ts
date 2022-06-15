import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import {
  setMarketplaceState,
} from './actions';

export type PodListing = {
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
  status: string;
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
  status: string;
};

export type BaseFillEvent = {
  // const timestamp = block.timestamp + myEvent.logIndex;
  timestamp: number; // FIXME: not calculated yet
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
  from: string;
  to: string;
}

export type PodListingFilled = BaseFillEvent & {
  type: 'PodListingFilled';
  // Mapped from PodListingFilledEvent
  index: BigNumber;
  start: BigNumber;
  amount: PodListing['totalAmount'];
  // Added
  pricePerPod: PodListing['pricePerPod']; // snapshot at time of fill
  filledBeans: BigNumber;
}

export type PodOrderFilled = BaseFillEvent & {
  type: 'PodOrderFilled';
  // Mapped from PodOrderFilledEvent
  index: BigNumber;
  start: BigNumber
  amount: PodOrder['totalAmount'];
  // Added
  pricePerPod: PodOrder['pricePerPod']; // snapshot at time of fill
  filledBeans: BigNumber;
}

export type PodOrderCreated = BaseFillEvent & { type: 'PodOrderCreated' };
export type PodOrderCancelled = BaseFillEvent & { type: 'PodOrderCancelled' };
export type PodListingCreated = BaseFillEvent & { type: 'PodListingCreated' };
export type PodListingCancelled = BaseFillEvent & { type: 'PodListingCancelled' };

export type MarketHistoryItem = (
  PodListingFilled
  | PodOrderFilled
  // PodListingCreated
  // | PodListingFilled
  // | PodListingCancelled
  // | PodOrderCreated
  // | PodOrderFilled
  // | PodOrderCancelled
);

export type MarketStats = {
  podVolume: BigNumber;
  beanVolume: BigNumber;
  countFills: BigNumber;
  listings: {
    sumRemainingAmount: BigNumber;
  },
  orders: {
    sumRemainingAmount: BigNumber;
  }
}
export interface MarketState {
  listings: PodListing[];
  orders: PodOrder[];
  history: MarketHistoryItem[];
  stats: MarketStats;
}

export const initialState: MarketState = {
  listings: [],
  orders: [],
  history: [],
  stats: {
    podVolume: new BigNumber(0),
    beanVolume: new BigNumber(0),
    countFills: new BigNumber(0),
    listings: {
      sumRemainingAmount: new BigNumber(0)
    },
    orders: {
      sumRemainingAmount: new BigNumber(0)
    }
  }
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setMarketplaceState, (state, { payload }) => {
    state.listings = payload.listings;
    state.orders = payload.orders;
    state.history = payload.history;
    state.stats = payload.stats;
  })
);
