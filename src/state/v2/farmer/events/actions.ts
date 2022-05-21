import { createAction } from '@reduxjs/toolkit';

export const resetEvents = createAction(
  'farmer/events/reset'
);

export const setEvents = createAction(
  'farmer/events/set'
);

export const appendEvents = createAction(
  'farmer/events/append'
);