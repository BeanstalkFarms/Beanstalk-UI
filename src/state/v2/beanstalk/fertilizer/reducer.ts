import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { Fertilizer } from '.';
import { resetFertilizer, setRemaining, setTotalRaised } from './actions';

const ZERO = new BigNumber(0);
// const NEG1 = new BigNumber(-1);

const initialState : Fertilizer = {
  remaining: ZERO,
  totalRaised: ZERO,
  // humidity: NEG1,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setRemaining, (state, { payload }) => {
      state.remaining = payload;
    })
    .addCase(setTotalRaised, (state, { payload }) => {
      state.totalRaised = payload;
    })
    .addCase(resetFertilizer, () => initialState)
    // .addCase(setHumidity, (state, { payload }) => {
    //   state.humidity = payload;
    // })
);