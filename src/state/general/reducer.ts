import { createReducer } from '@reduxjs/toolkit';
import { Listing } from 'state/userBalance/updater';
import {
  setInitialized,
  setMetamaskFailure,
  setLastCross,
  setBips,
  setHasActiveBIP,
  setContractEvents,
  setMarketplaceListings,
  setHasActiveFundraiser,
  setFundraisers,
  setWidth,
} from './actions';

export interface GeneralState {
  initialized: Boolean;
  metamaskFailure: Number;
  lastCross: Number;
  bips: Array;
  hasActiveBIP: Boolean;
  fundraisers: Array;
  hasActiveFundraiser: Boolean;
  contractEvents: Array;
  marketplaceListings: Listing[];
  width: Number;
}

export const initialState: GeneralState = {
  initialized: false,
  metamaskFailure: -1,
  lastCross: 0,
  bips: [],
  hasActiveBIP: false,
  contractEvents: [],
  marketplaceListings: [],
  width: window.innerWidth,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setInitialized, (state, { payload }) => {
      state.initialized = payload;
    })
    .addCase(setMetamaskFailure, (state, { payload }) => {
      state.metamaskFailure = payload;
    })
    .addCase(setLastCross, (state, { payload }) => {
      state.lastCross = payload;
    })
    .addCase(setBips, (state, { payload }) => {
      state.bips = payload;
    })
    .addCase(setHasActiveBIP, (state, { payload }) => {
      state.hasActiveBIP = payload;
    })
    .addCase(setFundraisers, (state, { payload }) => {
      state.fundraisers = payload;
    })
    .addCase(setHasActiveFundraiser, (state, { payload }) => {
      state.hasActiveFundraiser = payload;
    })
    .addCase(setContractEvents, (state, { payload }) => {
      state.contractEvents = payload;
    })
    .addCase(setMarketplaceListings, (state, { payload }) => {
      state.marketplaceListings = payload;
    .addCase(setWidth, (state, { payload }) => {
      state.width = payload;
    })
);
