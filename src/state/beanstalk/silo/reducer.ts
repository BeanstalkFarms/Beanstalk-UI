import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BeanstalkSilo } from '.';
import { resetBeanstalkSilo, updateBeanstalkSiloAssets } from './actions';

const NEG1 = new BigNumber(-1);

const initialState : BeanstalkSilo = {
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
    .addCase(resetBeanstalkSilo, () => {
      console.debug('[beanstalk/silo/reducer] reset');
      return initialState;
    })
    .addCase(updateBeanstalkSiloAssets, (state, { payload }) => {
      state.beans = payload.beans;
      state.stalk = payload.stalk;
      state.seeds = payload.seeds;
      state.roots = payload.roots;
    })
);
