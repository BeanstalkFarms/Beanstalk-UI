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
} from './actions';

export interface GeneralState {
  initialized: Boolean;
  metamaskFailure: Number;
  lastCross: Number;
  bips: Array;
  hasActiveBIP: Boolean;
  contractEvents: Array;
  marketplaceListings: Listing[];

}

export const initialState: GeneralState = {
  initialized: false,
  metamaskFailure: -1,
  lastCross: 0,
  bips: [],
  hasActiveBIP: false,
  contractEvents: [],
  marketplaceListings: [],
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
    .addCase(setContractEvents, (state, { payload }) => {
      state.contractEvents = payload;
    })
    .addCase(setMarketplaceListings, (state, { payload }) => {
      state.marketplaceListings = payload;
    })
);
