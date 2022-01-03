import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { setMarketplaceListings } from './actions';

export type Listing = {
  listerAddress: string;
  // not sure what to call index that does not subtract harvested pods
  objectiveIndex: BigNumber;
  pricePerPod: BigNumber;
  expiry: BigNumber;
  initialAmount: BigNumber;
  amountSold: BigNumber;
  status: string;
};

export type BuyOffer = {
  listerAddress: string;
  maxPlaceInLine: number;
  initialAmountToBuy: number;
  pricePerPod: number;
  amountBought: number;
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
