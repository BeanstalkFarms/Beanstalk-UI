import { createReducer } from '@reduxjs/toolkit';
import {
  updateTokenPrices,
} from './actions';

export interface ApplicationState {
  prices: {
    [symbol: string]: number
  };
}

export const initialState: ApplicationState = {
  prices: {},
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateTokenPrices, (state, { payload }) => {
      for (const el of payload) {
        state.prices[el.key] = el.value;
      }
    })
);
