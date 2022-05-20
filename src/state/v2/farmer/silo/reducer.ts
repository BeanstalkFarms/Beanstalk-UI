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
};

const initialState : Silo = {
  tokens: {},
  stalk: initialSiloAsset,
  seeds: initialSiloAsset,
  roots: initialSiloAsset,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateUserTokenBalances, (state, { payload }) => {
      const addresses = Object.keys(payload);
      addresses.forEach((address) => {
        state.tokens[address] = {
          ...state.tokens[address],
          ...payload[address]
        };
      });
    })
    .addCase(updateSiloAssets, (state, { payload }) => {
      state.stalk = payload.stalk;
      state.seeds = payload.seeds;
      state.roots = payload.roots;
    })
);
