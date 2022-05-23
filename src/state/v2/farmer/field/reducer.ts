import { createReducer } from '@reduxjs/toolkit';
import { Field } from '.';
import { updateFarmerField } from './actions';

const initialState : Field = {
  plots: {},
  harvestablePlots: {},
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateFarmerField, (state, { payload }) => {
      state.plots = payload.plots;
      state.harvestablePlots = payload.harvestablePlots;
    })
);
