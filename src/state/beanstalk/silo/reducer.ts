import { createReducer } from '@reduxjs/toolkit';
import { NEW_BN } from 'constants/index';
import { BeanstalkSilo } from '.';
import { resetBeanstalkSilo, updateBeanstalkSiloAssets } from './actions';

const initialState : BeanstalkSilo = {
  tokens: {},
  beans: {
    total: NEW_BN,
    earned: NEW_BN,
  },
  stalk: {
    active: NEW_BN,
    earned: NEW_BN,
    grown: NEW_BN,
    total: NEW_BN,
  },
  seeds: {
    active: NEW_BN,
    earned: NEW_BN,
    total: NEW_BN,
  },
  roots: {
    total: NEW_BN, 
  }
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetBeanstalkSilo, () => {
      console.debug('[beanstalk/silo/reducer] reset');
      return initialState;
    })
    .addCase(updateBeanstalkSiloAssets, (state, { payload }) => {
      state.tokens = payload.tokens;
      state.beans = payload.beans;
      state.stalk = payload.stalk;
      state.seeds = payload.seeds;
      state.roots = payload.roots;
    })
);
