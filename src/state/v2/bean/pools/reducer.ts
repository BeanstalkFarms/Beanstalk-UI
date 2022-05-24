import { createReducer } from '@reduxjs/toolkit';
import { BeanPools } from '.';
import { updateBeanPool, updateBeanPools } from './actions';

const initialState : BeanPools = {};

// Pools.all.forEach((pool) => {
//   initialState[pool.address] = {
//     price: new BigNumber(-1),
//     reserves: [new BigNumber(-1), new BigNumber(-1)],
//     deltaB: new BigNumber(-1),
//     totalCrosses: new BigNumber(-1),
//   };
// });

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
);
