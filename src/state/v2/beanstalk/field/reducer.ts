import BigNumber from 'bignumber.js';
import { createReducer } from '@reduxjs/toolkit';
import { updateHarvestableIndex } from './actions';

const initialState = {
  harvestableIndex: new BigNumber(-1),
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateHarvestableIndex, (state, { payload }) => {
      state.harvestableIndex = payload;
    })
);
