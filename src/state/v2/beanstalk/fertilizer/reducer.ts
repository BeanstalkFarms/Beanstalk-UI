import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { Fertilizer } from '.';
import { resetFertilizer, setRemaining, setTotalRaised } from './actions';

const NEG1 = new BigNumber(-1);

const initialState : Fertilizer = {
  remaining: NEG1,
  totalRaised: NEG1,
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
    .addCase(resetFertilizer, () => {
      return initialState;
    })
    // .addCase(setHumidity, (state, { payload }) => {
    //   state.humidity = payload;
    // })
);
