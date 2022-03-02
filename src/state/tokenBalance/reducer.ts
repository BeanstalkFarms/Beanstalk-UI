import { createReducer, Dictionary } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import { supportedTokens } from 'constants/index';
import {
  setTokenBalance,
} from './actions';

export const initialState: Dictionary<BigNumber> =
  supportedTokens.reduce((acc: Dictionary<BigNumber>, t) => {
    acc[t.address] = new BigNumber(0);
    return acc;
  }, {});

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setTokenBalance, (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state[key] = payload[key];
      });
    })
);
