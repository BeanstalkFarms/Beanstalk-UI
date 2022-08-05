import { createReducer } from '@reduxjs/toolkit';
import { NEW_BN } from 'constants/index';
import { FarmerBarn } from '.';
import { resetFarmerBarn, updateFarmerBarn } from './actions';

const initialState : FarmerBarn = {
  fertilizer:           {},
  unfertilizedSprouts:  NEW_BN,
  fertilizedSprouts:    NEW_BN,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateFarmerBarn, (state, { payload }) => {
      state.fertilizer = {
        ...state.fertilizer,
        ...payload.fertilizer,
      };
      state.unfertilizedSprouts = payload.unfertilizedSprouts;
      state.fertilizedSprouts = payload.fertilizedSprouts;
    })
    .addCase(resetFarmerBarn, () => initialState)
);
