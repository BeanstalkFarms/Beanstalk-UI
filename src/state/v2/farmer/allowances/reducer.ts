import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import {
  clearAllowances,
  updateAllowance, updateAllowances,
} from './actions';

export interface AllowanceState {
  [token: string]: BigNumber;
}

export const initialState: AllowanceState = {};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateAllowance, (state, { payload }) => {
      state[payload.token.addr] = payload.allowance;
    })
    .addCase(updateAllowances, (state, { payload }) => {
      payload.forEach((elem) => {
        state[elem.token.addr] = elem.allowance;
      });
    })
    .addCase(clearAllowances, (state, { payload }) => {
      state = initialState;
    })
);
