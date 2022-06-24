import { createAction } from '@reduxjs/toolkit';
import { Event } from 'lib/Beanstalk/EventProcessor';

export const resetEvents = createAction(
  'farmer/events/reset'
);

export const setEvents = createAction<Event[]>(
  'farmer/events/set'
);

export const appendEvents = createAction(
  'farmer/events/append'
);
