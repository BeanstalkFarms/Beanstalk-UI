import { createReducer } from '@reduxjs/toolkit';
import { BeanPools } from '.';
import { resetPools, updateBeanPool, updateBeanPools } from './actions';

const initialState : BeanPools = {};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBeanPool, (state, { payload }) => {
      state[payload.address] = payload.pool;
    })
    .addCase(updateBeanPools, (state, { payload }) => {
      payload.forEach((pl) => {
        state[pl.address] = pl.pool;
      });
    })
    .addCase(resetPools, () => {
      return initialState;
    })
);
