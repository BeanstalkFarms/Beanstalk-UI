import { createReducer } from '@reduxjs/toolkit';
import { FarmerFertilizer } from '.';
import { updateFertTokens } from './actions';

// const NEG1 = new BigNumber(-1);

const initialState : FarmerFertilizer = {
  tokens: {}
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateFertTokens, (state, { payload }) => {
      state.tokens = {
        ...state.tokens,
        ...payload,
      };
    })
);
