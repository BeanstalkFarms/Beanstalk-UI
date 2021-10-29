import { createAction } from '@reduxjs/toolkit';

export const setWeather = createAction<Object>(
  'weather/setWeather'
);
