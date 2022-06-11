import { createReducer } from '@reduxjs/toolkit';
import { resetEvents, setEvents } from './actions';
import { ParsedEvent } from './updater';

const initialState : ParsedEvent[] = [];

export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetEvents, () => {
      console.debug('[farmer/silo/reducer] reset');
      return initialState;
    })
    .addCase(setEvents, (_, { payload }) => payload)
);
