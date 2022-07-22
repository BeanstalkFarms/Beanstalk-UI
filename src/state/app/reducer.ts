import { createReducer } from '@reduxjs/toolkit';
import { App } from '.';
import {
  setAlmanacView, setEthPrices,
} from './actions';

export const initialState: App = {
  almanacView: false,
  ethPrices: null,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setAlmanacView, (state, { payload }) => {
      state.almanacView = payload;
    })
    .addCase(setEthPrices, (state, { payload }) => {
      state.ethPrices = payload;
    })
);
