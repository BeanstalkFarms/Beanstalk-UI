import { createReducer } from '@reduxjs/toolkit';
// import BigNumber from 'bignumber.js';
import { resetEvents, setEvents } from './actions';
import { ParsedEvent } from './updater';

const initialState : ParsedEvent[] = [];

export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetEvents, (state) => {
      console.debug('[farmer/silo/reducer] reset');
      return initialState;
    })
    .addCase(setEvents, (state, { payload }) => payload)
);
