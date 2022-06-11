import { createAction } from '@reduxjs/toolkit';
import { ParsedEvent } from './updater';

export const resetEvents = createAction(
  'farmer/events/reset'
);

export const setEvents = createAction<ParsedEvent[]>(
  'farmer/events/set'
);

export const appendEvents = createAction(
  'farmer/events/append'
);
