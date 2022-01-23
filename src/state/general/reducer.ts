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
  // addTransaction,
  // completeTransaction,
  // Transaction,
  // TransactionState,
  // updateTransactionHash,
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
  // transactions: Array<Transaction>;
  width: Number;
  drawerOpen: boolean;
}

export const initialState: GeneralState = {
  initialized: false,
  metamaskFailure: -1,
  lastCross: 0,
  bips: [],
  hasActiveBIP: false,
  contractEvents: [],
  // transactions: [],
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
    // TEMPORARILY DEPRECATED - 1/23/2022
    // To be replaced or upgraded after form overhaul, Q1 2022.
    // ----
    // .addCase(addTransaction, (state, { payload }) => {
    //   state.transactions = [...state.transactions, payload];
    // })
    // .addCase(updateTransactionHash, (state, { payload }) => {
    //   const index = state.transactions.findIndex(
    //     (trans) => trans.transactionNumber === payload.transactionNumber
    //   );
    //   if (index >= 0) {
    //     const newTransaction = {
    //       ...state.transactions[index],
    //       transactionHash: payload.transactionHash,
    //     };

    //     state.transactions = [
    //       ...state.transactions.slice(0, index),
    //       newTransaction,
    //       ...state.transactions.slice(index + 1),
    //     ];
    //   }
    // })
    // .addCase(completeTransaction, (state, { payload }) => {
    //   const index = state.transactions.findIndex(
    //     (txn) => txn.transactionNumber === payload
    //   );
    //   if (index >= 0) {
    //     const newTransaction = {
    //       ...state.transactions[index],
    //       state: TransactionState.DONE,
    //     };

    //     state.transactions = [
    //       ...state.transactions.slice(0, index),
    //       newTransaction,
    //       ...state.transactions.slice(index + 1),
    //     ];
    //   }
    // })
    .addCase(setDrawerOpen, (state, { payload }) => {
      state.drawerOpen = payload;
    })
);
