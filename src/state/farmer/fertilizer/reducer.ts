import { createReducer } from '@reduxjs/toolkit';
import { NEW_BN } from 'constants/index';
import { FarmerFertilizer } from '.';
import { resetFertilizer, updateFarmerFertilizer } from './actions';

const initialState : FarmerFertilizer = {
  tokens: {},
  unfertilized: NEW_BN,
  fertilized: NEW_BN,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateFarmerFertilizer, (state, { payload }) => {
      state.tokens = {
        ...state.tokens,
        ...payload.tokens,
      };
      state.unfertilized = payload.unfertilized;
      state.fertilized = payload.fertilized;
    })
    .addCase(resetFertilizer, () => initialState)
);
