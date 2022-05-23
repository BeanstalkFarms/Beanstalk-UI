import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { Sun } from '.';
import { updateSeason } from './actions';

const NEG1 = new BigNumber(-1);

const initialState : Sun = {
  season: NEG1,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateSeason, (state, { payload }) => {
      state.season = payload;
    })
);
