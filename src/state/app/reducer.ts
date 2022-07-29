import { createReducer } from '@reduxjs/toolkit';
import { App } from '.';
import {
  setAlmanacView, setEthPrices, updateSetting,
} from './actions';

export const initialState: App = {
  almanacView: false,
  ethPrices: null,
  settings: {
    denomination: 'usd',
  }
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setAlmanacView, (state, { payload }) => {
      state.almanacView = payload;
    })
    .addCase(setEthPrices, (state, { payload }) => {
      state.ethPrices = payload;
    })
    .addCase(updateSetting, (state, { payload }) => {
      state.settings[payload.key] = payload.value;
    })
);
