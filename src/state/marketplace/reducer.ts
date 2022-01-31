import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import {
  setMarketplaceListings,
} from './actions';

export type Listing = {
  /**
   * The address of the Farmer that owns the Listing.
   */
  account: string;

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
  index: BigNumber;

  /**
   * Price per Pod, in Beans.
   */
  pricePerPod: BigNumber;

  /**
   * The relative position in line at which this listing expires.
   * This is what the User defines. I.e. "100,000 in the Pod Line"
   * On-chain, it is stored as `maxHarvestableIndex`.
   */
  expiresIn: BigNumber;

  /**
   * The absolute position in line at which this listing expires.
   * (harvestableIndex + expiresIn).
   *
   * NOTE that the above harvestableIndex is the harvestableIndex
   * at the toime of listing.
   */
  maxHarvestableIndex: BigNumber;

  /**
   * The total number of Pods to sell.
   */
  initialAmount: BigNumber;

  /**
   * The amount of Pods that have been bought from this Listing.
   *
   * `0 < amountSold < initialAmount`
   */
  amountSold: BigNumber;

  /**
   * The number of Pods left to sell.
   * When a Listing is created, `amount = initialAmount`.
   *
   * `amount = initialAmount - amountSold`
   * `initialAmount > amount > 0`
   */
  amount: BigNumber;

  /**
   * Listing status.
   *
   * FIXME: make this an enum
   */
  status: string;
};

export type BuyOffer = {
  /**
   * Wallet address
   */
  listerAddress: string;

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

  /**
   * The total number of Pods that can be sold to this BuyOffer.
   *
   * FIXME: "ToBuy" naming here; this differs from Listing.
   */
  initialAmountToBuy: BigNumber;

  /**
   * The amount of Pods that have been sold to this BuyOffer.
   *
   * `0 < amountBought < initialAmountToBuy`
   */
  amountBought: BigNumber;

  /**
   * The amount of Pods that can still be sold to this BuyOffer.
   *
   * `amount = initialAmountToBuy - amountBought`
   * `initialAmountToBuy > amount > 0`
   */
  amount: BigNumber;

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
  listings: Listing[];

  /**
   *
   */
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
