import { createReducer } from '@reduxjs/toolkit';
import { FarmerFertilizer } from '.';
import { resetFertilizer, updateFertilizer } from './actions';

const initialState : FarmerFertilizer = {
  tokens: {}
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateFertilizer, (state, { payload }) => {
      state.tokens = {
        ...state.tokens,
        ...payload,
      };
    })
    .addCase(resetFertilizer, () => initialState)
);
