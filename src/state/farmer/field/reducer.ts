import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { Field } from '.';
import { updateFarmerField } from './actions';

const initialState: Field = {
  plots: {},
  harvestablePlots: {},
  pods: new BigNumber(0),
  harvestablePods: new BigNumber(0),
};

export default createReducer(initialState, (builder) =>
  builder.addCase(updateFarmerField, (state, { payload }) => {
    state.plots = payload.plots;
    state.harvestablePlots = payload.harvestablePlots;
    state.pods = payload.pods;
    state.harvestablePods = payload.harvestablePods;
  })
);
