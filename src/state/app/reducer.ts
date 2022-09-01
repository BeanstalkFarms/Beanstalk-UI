import { createReducer } from '@reduxjs/toolkit';
import { App } from '.';
import { setEthPrices, setGlobal, updateSetting,
} from './actions';

export const initialState: App = {
  ethPrices: null,
  settings: { 
    denomination: 'usd',
  },
  globals: {
    showSettings: false,
  }
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setEthPrices, (state, { payload }) => {
      state.ethPrices = payload;
    })
    .addCase(updateSetting, (state, { payload }) => {
      state.settings[payload.key] = payload.value;
    })
    .addCase(setGlobal, (state, { payload }) => {
      state.globals[payload.key] = payload.value;
    })
);
