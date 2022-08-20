import { createReducer } from '@reduxjs/toolkit';
import { BeanstalkGovernance } from '.';
import {
  resetBeanstalkGovernance,
  updateActiveProposals
} from './actions';

const initialState : BeanstalkGovernance = {
  activeProposals: []
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetBeanstalkGovernance, () => initialState)
    .addCase(updateActiveProposals, (state, { payload }) => {
      state.activeProposals = payload.activeProposals;
    })
);
