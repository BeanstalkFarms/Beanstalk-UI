import { createReducer } from '@reduxjs/toolkit';
// import BigNumber from 'bignumber.js';
import type { Events } from '.';
import { resetEvents, setEvents } from './actions';

const initialState : Events[] = [];

export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetEvents, (state) => {
      console.debug(`[farmer/silo/reducer] reset`)
      return initialState;
    })
    .addCase(setEvents, (state, { payload }) => {
      return payload;
    })
);
