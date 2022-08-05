import { createReducer } from '@reduxjs/toolkit';
import { Unripe } from '.';
import { resetUnripe, updateUnripe } from './actions';

export const initialState : Unripe = {
  chopRates: {}
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetUnripe, () => initialState)
    .addCase(updateUnripe, (state, { payload }) => {
      state.chopRates = payload.chopRates;
    })
);
