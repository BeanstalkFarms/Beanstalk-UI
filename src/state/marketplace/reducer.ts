import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import {
  setMarketplaceListings,
} from './actions';

export type Listing = {
  /**
   * The absolute index of the listed Plot in the Pod Line.
   *
   * Measured from the front, so the Listing contains all Pods between
   * (objectiveIndex) and (objectiveIndex + initialAmount).
   *
   * An example where the podLine is 50,000 but the objectiveIndex is 150,000:
   *    0         the first Pod issued
   *    100,000   harvestableIndex
   *    150,000   objectiveIndex
   */
  objectiveIndex: BigNumber;
  /**
   * Price per Pod, in Beans.
   */
  pricePerPod: BigNumber;
  /**
   * The relative position in line at which this listing expires.
   * This is what the User defines. I.e. "100,000 in the Pod Line"
   * On-chain, it is stored as `expiry`.
   */
  expiresIn: BigNumber;
  /**
   * The absolute position in line at which this listing expires.
   * (harvestableIndex + expiresIn).
   *
   * NOTE that the above harvestableIndex is the harvestableIndex
   * at the toime of listing.
   */
  expiry: BigNumber;
  /**
   * The total number of Pods to sell.
   */
  intialAmount: BigNumber;
  /**
   * The amount of Pods that have been bought from this Listing.
   * 0 < amountSold < initialAmount
   */
  amountSold: BigNumber;
  /** Wallet address */
  listerAddress: string;
  status: string;
};

export type BuyOffer = {
  /**
   * ???
   */
  index: BigNumber;
  /**
   * The User is willing to buy any Pod that is before maxPlaceInLine at pricePerPod.
   * As the Pod Line moves, this value stays the same because new Pods meet the criteria.
   */
  maxPlaceInLine: BigNumber;
  /**
   * The total number of Pods that can be sold to this BuyOffer.
   */
  initialAmountToBuy: BigNumber;
  /**
   * The amount of Pods that have been sold to this BuyOffer.
   * 0 < amountBought < initialAmountToBuy
   */
  amountBought: BigNumber;
  /**
   * The price per Pod, in Beans.
   */
  pricePerPod: BigNumber;
  /** Wallet address */
  listerAddress: string;
  /** */
  status: string;
};

export interface MarketplaceState {
  listings: Listing[];
  buyOffers: BuyOffer[];
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
