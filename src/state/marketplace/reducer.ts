import { createReducer } from '@reduxjs/toolkit';
import {
  setMarketplaceListings,
  setMarketplaceBuyOffers,
} from './actions';

export type Listing = {
  listerAddress: string;
  // not sure what to call index that does not subtract harvested pods
  objectiveIndex: number;
  pricePerPod: number;
  expiresIn: number;
  intialAmount: number;
  amountSold: number;
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
  builder
    .addCase(setMarketplaceListings, (state, { payload }) => {
      state.listings = payload;
    })
    .addCase(setMarketplaceBuyOffers, (state, { payload }) => {
      state.buyOffers = payload;
    })
);
