import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { Fertilizer } from '.';
import { setAvailable } from './actions';

const NEG1 = new BigNumber(-1);

const initialState : Fertilizer = {
  available: NEG1,
  humidity: NEG1,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setAvailable, (state, { payload }) => {
      state.available = payload;
    })
);
