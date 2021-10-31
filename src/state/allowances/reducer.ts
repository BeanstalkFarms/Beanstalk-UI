import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import {
  updateBeanstalkBeanAllowance,
  updateUniswapBeanAllowance,
  updateBeanstalkLPAllowance,
} from './actions';

export interface AllowanceState {
  uniswapBeanAllowance: BigNumber;
  beanstalkBeanAllowance: BigNumber;
  beanstalkLPAllowance: BigNumber;
}

export const initialState: AllowanceState = {
  uniswapBeanAllowance: new BigNumber(0),
  beanstalkBeanAllowance: new BigNumber(0),
  beanstalkLPAllowance: new BigNumber(0),
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBeanstalkBeanAllowance, (state, { payload }) => {
      state.beanstalkBeanAllowance = payload;
    })
    .addCase(updateUniswapBeanAllowance, (state, { payload }) => {
      state.uniswapBeanAllowance = payload;
    })
    .addCase(updateBeanstalkLPAllowance, (state, { payload }) => {
      state.beanstalkLPAllowance = payload;
    })
);
