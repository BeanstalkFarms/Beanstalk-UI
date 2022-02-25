import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
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

export type BIP = {
  /**
   * id - int / BigNumber
   * 
   * id of the bip
   */
  id: BigNumber;

  /**
   * executed - boolean
   * 
   * Whether the bip has passed or not
   */
  executed: boolean;

  /**
   * pauseOrUnpause - int / BigNumber, 0 for neither, 1 for pause, 2 for unpause
   * 
   * Whether the BIP will either pause or unpause Beanstalk. Has never been used and hopefully will never,
   * but if a BIP is a pause/unpause and contains no diamond cut, then it can be commited via super majority instantly.
   */
  pauseOrUnpause: BigNumber;

  /**
   * start - int / BigNumber
   * 
   * The start season of the bip
   */
  start: BigNumber;

  /**
   * period - int / BigNumber
   * 
   * the number of seasons the bip lasts for
   */
  period: BigNumber;

  /**
   * proposer - address, the farmer that proposed the bip
   */
  proposer: string;

  /**
   * roots - int / BigNumber
   * 
   * the number of roots that have voted for the BIP (roots are not an actual token and thus don't have a defined # of decimals) 
   */
  roots: BigNumber;

  /**
   * endTotalRoots - int / BigNumber
   * 
   * if the BIP is ended, then endTotalRoots is the number of total Roots.
   */
  endTotalRoots: BigNumber;

  /**
   * timestamp - int / BigNumber
   * 
   * the timestamp of when the BIP was proposed.
   */
  timestamp: BigNumber;

  /**
   * active - boolean
   * 
   * whether the BIP is still active or not.
   */
  active: boolean;
}

export type Fundraiser = {
  /**
   * id - int / BigNumber
   * 
   * id of the fundraiser
   */
  id: BigNumber;

  /**
   * remaining: float / BigNumber 
   * 
   * the remaining tokens in the fundraiser
   */
  remaining: BigNumber;

  /**
   * total: float / BigNumber
   * 
   * the total tokens in the fundraiser
   */
  total: BigNumber;

  /**
   * token - address
   * 
   * the address of the token the fundraiser is taking place in
   */
  token: string;
}

export interface GeneralState {
  /**
   * While `false`, the Beanstalk app is still preparing data. 
   * Show <LoadingBean />. See `components/App/index.tsx`.
   * 
   * Set to `true` after updating balances and parsing events in `userBalance/updater.ts`.
   */
  initialized: boolean;

  /**
   * FIXME: enum
   */
  metamaskFailure: number;

  /**
   * The timestamp of the last time the price of Bean in the Uniswap Bean:Eth pool crossed above/below the price of $1.
   */
  lastCross: number;

  /**
   * 
   */
  bips: BIP[];

  /**
   * 
   */
  hasActiveBIP: boolean;

  /**
   * 
   */
  fundraisers: Fundraiser[];
  
  /**
   * 
   */
  hasActiveFundraiser: boolean;
  
  /**
   * FIXME: define Contract Event type
   */
  contractEvents: Array;
  
  // transactions: Array<Transaction>;

  /**
   * The current width of the viewport.
   */
  width: number;

  /**
   * Sidebar drawer open/close state.
   */
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
