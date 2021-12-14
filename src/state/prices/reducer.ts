import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import {
  setPrices,
} from './actions';

export interface PriceState {
  beanPrice: BigNumber;
  usdcPrice: BigNumber;
  ethReserve: BigNumber;
  beanReserve: BigNumber;
  beanTWAPPrice: BigNumber;
  usdcTWAPPrice: BigNumber;
  beansToPeg: BigNumber;
  lpToPeg: BigNumber;
}

export const initialState: PriceState = {
  beanPrice: new BigNumber(-1),
  usdcPrice: new BigNumber(-1),
  ethReserve: new BigNumber(-1),
  beanReserve: new BigNumber(-1),
  beanTWAPPrice: new BigNumber(-1),
  usdcTWAPPrice: new BigNumber(-1),
  beansToPeg: new BigNumber(-1),
  lpToPeg: new BigNumber(-1),
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setPrices, (state, { payload }) => {
      Object.keys(payload).map((key) => {
        state[key] = payload[key];
        return state[key];
      });
    })
);
