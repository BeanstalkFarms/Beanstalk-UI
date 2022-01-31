import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import {
  setMarketplaceListings,
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
   * Price per Pod, in Beans.
   */
  pricePerPod: BigNumber;

  /**
   * The absolute position in line at which this listing expires.
   * (harvestableIndex + expiresIn).
   *
   * NOTE: the above harvestableIndex is a snapshot at the time of listing.
   */
  maxHarvestableIndex: BigNumber;

  // -- Amounts

  /**
   * The total number of Pods to sell.
   */
  totalAmount: BigNumber;

  /**
   * The number of Pods left to sell.
   * When a Listing is created, `amount = initialAmount`.
   *
   * `remainingAmount = totalAmount - filledAmount`
   * `totalAmount > remainingAmount > 0`
   */
  remainingAmount: BigNumber;

  /**
   * The amount of Pods that have been bought from this PodListing.
   *
   * `0 < filledAmount < totalAmount`
   */
  filledAmount: BigNumber;

  /**
   * Listing status.
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
   * Ordinal index of buy offer - 0, 1, 2...
   */
  orderId: BigNumber;

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
   * The total number of Pods that can be sold to this BuyOffer.
   *
   * FIXME: "ToBuy" naming here; this differs from Listing.
   */
  totalAmount: BigNumber;

  /**
   * The amount of Pods that can still be sold to this BuyOffer.
   *
   * `amount = initialAmountToBuy - amountBought`
   * `initialAmountToBuy > amount > 0`
   */
  remainingAmount: BigNumber;

  /**
   * The amount of Pods that have been sold to this BuyOffer.
   *
   * `0 < amountBought < initialAmountToBuy`
   */
  filledAmount: BigNumber;

  /**
   * Listing status.
   *
   * FIXME: make this an enum
   */
  status: string;
};

export interface MarketplaceState {
  /**
   *
   */
  listings: PodListing[];

  /**
   *
   */
  buyOffers: PodOrder[];
}

export const initialState: MarketplaceState = {
  listings: [],
  buyOffers: [],
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setMarketplaceListings, (state, { payload }) => {
    state.listings = payload.listings;
    state.buyOffers = payload.buyOffers;
  })
);
