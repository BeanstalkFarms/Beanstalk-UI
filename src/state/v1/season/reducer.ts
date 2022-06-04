import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import {
  setSeason,
} from './actions';

export interface SeasonState {
  season: BigNumber;
  timestamp: BigNumber;
  start: BigNumber;
  period: BigNumber;
}

export const initialState: SeasonState = {
  season: new BigNumber(-1),
  timestamp: new BigNumber(-1),
  start: new BigNumber(-1),
  period: new BigNumber(-1),
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setSeason, (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state[key] = payload[key];
      });
    })
);
