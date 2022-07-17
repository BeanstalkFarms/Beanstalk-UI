import { createReducer } from '@reduxjs/toolkit';
import { NEW_BN, ZERO_BN } from 'constants/index';
import { Barn } from '.';
import {
  resetBarn,
  setRemaining,
  setTotalRaised,
  setHumidity,
  updateBarn,
} from './actions';

const initialState: Barn = {
  remaining: ZERO_BN,
  totalRaised: ZERO_BN,
  humidity: NEW_BN,
  currentBpf: NEW_BN,
  endBpf: NEW_BN,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetBarn, () => initialState)
    .addCase(updateBarn, (state, { payload }) => {
      state.remaining = payload.remaining;
      state.humidity = payload.humidity;
      state.totalRaised = payload.totalRaised;
      state.currentBpf = payload.currentBpf;
      state.endBpf = payload.endBpf;
    })
    .addCase(setRemaining, (state, { payload }) => {
      state.remaining = payload;
    })
    .addCase(setTotalRaised, (state, { payload }) => {
      state.totalRaised = payload;
    })
    .addCase(setHumidity, (state, { payload }) => {
      state.humidity = payload;
    })
);
