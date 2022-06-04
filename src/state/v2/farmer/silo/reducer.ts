import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { FarmerSilo } from '.';
import { resetFarmerSilo, updateFarmerSiloAssets, updateFarmerTokenBalances } from './actions';

const NEG1 = new BigNumber(-1);

const initialState : FarmerSilo = {
  tokens: {},
  beans: {
    earned: NEG1,
  },
  stalk: {
    active: NEG1,
    earned: NEG1,
    grown: NEG1,
    total: NEG1,
  },
  seeds: {
    active: NEG1,
    earned: NEG1,
    total: NEG1,
  },
  roots: {
    total: NEG1, 
  }
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetFarmerSilo, () => {
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
