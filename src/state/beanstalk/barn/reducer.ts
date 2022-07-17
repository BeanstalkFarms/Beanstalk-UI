import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { NEW_BN, ZERO_BN } from 'constants/index';
import { Barn } from '.';
import { resetBarn, setRemaining, setTotalRaised, setHumidity } from './actions';

const initialState : Barn = {
  remaining: ZERO_BN,
  totalRaised: ZERO_BN,
  humidity: NEW_BN,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setRemaining, (state, { payload }) => {
      state.remaining = payload;
    })
    .addCase(setTotalRaised, (state, { payload }) => {
      state.totalRaised = payload;
    })
    .addCase(setHumidity, (state, { payload }) => {
      state.humidity = payload;
    })
    .addCase(resetBarn, () => initialState)
);
