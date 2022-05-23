import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { Silo } from '.';
import { reset, updateFarmerSiloAssets, updateFarmerTokenBalances } from './actions';

const NEG1 = new BigNumber(-1);

const initialState : Silo = {
  tokens: {},
  beans: {
    earned: NEG1,
  },
  stalk: {
    total: NEG1,
    active: NEG1,
    earned: NEG1,
    grown: NEG1,
  },
  seeds: {
    total: NEG1,
    active: NEG1,
    earned: NEG1,
  },
  roots: {
    total: NEG1, 
  }
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(reset, (state) => {
      console.debug('[farmer/silo/reducer] reset');
      return initialState;
    })
    .addCase(updateFarmerTokenBalances, (state, { payload }) => {
      const addresses = Object.keys(payload);
      addresses.forEach((address) => {
        state.tokens[address] = {
          ...state.tokens[address],
          ...payload[address]
        };
      });
    })
    .addCase(updateFarmerSiloAssets, (state, { payload }) => {
      state.beans = payload.beans;
      state.stalk = payload.stalk;
      state.seeds = payload.seeds;
      state.roots = payload.roots;
    })
);
