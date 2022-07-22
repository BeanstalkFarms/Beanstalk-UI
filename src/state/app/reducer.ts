import { createReducer } from '@reduxjs/toolkit';
import { App } from '.';
import {
  setAlmanacView,
} from './actions';

export const initialState: App = {
  almanacView: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setAlmanacView, (state, { payload }) => {
      state.almanacView = payload;
    })
);
