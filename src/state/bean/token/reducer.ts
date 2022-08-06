import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BeanToken } from '.';
import { updatePrice, updateSupply, updateDeltaB } from './actions';

const initialState : BeanToken = {
  price: new BigNumber(-1),
  supply: new BigNumber(-1),
  deltaB: new BigNumber(-1),
};

export default createReducer(initialState, (builder) => 
  builder
    .addCase(updatePrice, (state, { payload }) => {
      state.price = payload;
    })
    .addCase(updateSupply, (state, { payload }) => {
      state.supply = payload;
    })
    .addCase(updateDeltaB, (state, { payload }) => {
      state.deltaB = payload;
    })
);
