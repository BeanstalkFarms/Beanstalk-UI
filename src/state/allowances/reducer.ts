import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import {
  updateBeanstalkBeanAllowance,
  updateUniswapBeanAllowance,
  updateBeanstalkLPAllowance,
  updateBeanstalkUSDCAllowance,
  updateBeanstalkCurveAllowance,
  updateBeanstalkBeanlusdAllowance,
} from './actions';

export interface AllowanceState {
  uniswapBeanAllowance: BigNumber;
  beanstalkBeanAllowance: BigNumber;
  beanstalkLPAllowance: BigNumber;
  beanstalkUSDCAllowance: BigNumber;
  beanstalkCurveAllowance: BigNumber;
  beanstalkBeanlusdAllowance: BigNumber;
}

export const initialState: AllowanceState = {
  uniswapBeanAllowance: new BigNumber(0),
  beanstalkBeanAllowance: new BigNumber(0),
  beanstalkLPAllowance: new BigNumber(0),
  beanstalkUSDCAllowance: new BigNumber(0),
  beanstalkCurveAllowance: new BigNumber(0),
  beanstalkBeanlusdAllowance: new BigNumber(0),
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
    .addCase(updateBeanstalkUSDCAllowance, (state, { payload }) => {
      state.beanstalkUSDCAllowance = payload;
    })
    .addCase(updateBeanstalkCurveAllowance, (state, { payload }) => {
      state.beanstalkCurveAllowance = payload;
    })
    .addCase(updateBeanstalkBeanlusdAllowance, (state, { payload }) => {
      state.beanstalkBeanlusdAllowance = payload;
    })
);
