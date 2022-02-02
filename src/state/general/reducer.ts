import { createReducer } from '@reduxjs/toolkit';
import {
  setInitialized,
  setMetamaskFailure,
  setLastCross,
  setBips,
  setHasActiveBIP,
  setContractEvents,
  setHasActiveFundraiser,
  setFundraisers,
  setWidth,
  setDrawerOpen,
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
  width: Number;
  drawerOpen: boolean;
}

export const initialState: GeneralState = {
  initialized: false,
  metamaskFailure: -1,
  lastCross: 0,
  bips: [],
  hasActiveBIP: false,
  fundraisers: [],
  hasActiveFundraiser: false,
  contractEvents: [],
  width: window.innerWidth,
  drawerOpen: false,
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
    .addCase(setWidth, (state, { payload }) => {
      state.width = payload;
    })
    .addCase(setDrawerOpen, (state, { payload }) => {
      state.drawerOpen = payload;
    })
);
