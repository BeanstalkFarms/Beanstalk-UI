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

export type PodListingFill = BaseFillEvent & {
  type: 'PodListingFill';
  amount: PodListing['totalAmount'];      // 
  pricePerPod: PodListing['pricePerPod']; // match type; snapshot
  filledBeans: BigNumber;
}

export type PodOrderFill = BaseFillEvent & {
  type: 'PodOrderFill';
  amount: PodOrder['totalAmount'];        // match type
  pricePerPod: PodOrder['pricePerPod'];   // match type
  filledBeans: BigNumber;
}

export type MarketHistoryItem = (PodListingFill | PodOrderFill);

export interface MarketplaceState {
  listings: PodListing[];
  orders: PodOrder[];
  history: MarketHistoryItem[];
}

export const initialState: MarketplaceState = {
  listings: [],
  orders: [],
  history: [],
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setMarketplaceState, (state, { payload }) => {
    state.listings = payload.listings;
    state.orders = payload.orders;
    state.history = payload.history;
  })
);
