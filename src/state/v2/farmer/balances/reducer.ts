import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import {
  clearBalances,
  updateBalance, updateBalances,
} from './actions';

export interface BalanceState {
  [token: string]: BigNumber;
}

export const initialState: BalanceState = {};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBalance, (state, { payload }) => {
      state[payload.token.address] = payload.balance;
    })
    .addCase(updateBalances, (state, { payload }) => {
      payload.forEach((elem) => {
        state[elem.token.address] = elem.balance;
      });
    })
    .addCase(clearBalances, () => initialState)
);
