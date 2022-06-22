import { createReducer } from '@reduxjs/toolkit';
import { Event } from 'lib/Beanstalk/EventProcessor';
import { resetEvents, setEvents } from './actions';

const initialState : Event[] = [];

export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetEvents, () => {
      console.debug('[farmer/silo/reducer] reset');
      return initialState;
    })
    .addCase(setEvents, (_, { payload }) => payload)
);
