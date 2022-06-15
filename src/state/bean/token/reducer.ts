import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BeanToken } from '.';
import { updateBeanPrice, updateBeanSupply } from './actions';

const initialState : BeanToken = {
  price: new BigNumber(-1),
  supply: new BigNumber(-1),
};

export default createReducer(initialState, (builder) => 
  builder
    .addCase(updateBeanPrice, (state, { payload }) => {
      state.price = payload;
    })
    .addCase(updateBeanSupply, (state, { payload }) => {
      state.supply = payload;
    })
);
