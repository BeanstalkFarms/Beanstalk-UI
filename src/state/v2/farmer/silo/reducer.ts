import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { Silo } from '.';
import { updateSiloAssets, updateUserTokenBalances } from './actions';

const NEG1 = new BigNumber(-1);

const initialSiloAsset = {
  total: NEG1,
  active: NEG1,
  earned: NEG1,
  grown: NEG1,
}

const initialState : Silo = {
  tokens: {},
  stalk: initialSiloAsset,
  seeds: initialSiloAsset,
  roots: initialSiloAsset,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateUserTokenBalances, (state, { payload }) => {
      for(let key in payload) {
        state.tokens[key] = Object.assign(
          {},
          state.tokens[key],
          payload[key]
        );
      }
    })
    .addCase(updateSiloAssets, (state, { payload }) => {
      state.stalk = payload.stalk;
      state.seeds = payload.seeds;
      state.roots = payload.roots;
    })
);
