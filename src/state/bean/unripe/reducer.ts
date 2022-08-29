import { createReducer } from '@reduxjs/toolkit';
import { Unripe } from '.';
import { resetUnripe, updateUnripe } from './actions';

export const initialState : Unripe = {
  chopPenalties: {}
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetUnripe, () => initialState)
    .addCase(updateUnripe, (state, { payload }) => {
      state.chopPenalties = payload.chopPenalties;
    })
);
