import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { getNextHour, Sun } from '.';
import { updateSeason } from './actions';

const NEG1 = new BigNumber(-1);

const getInitialState = () => {
  const nextSunrise = getNextHour();
  return {
    season: NEG1,
    sunrise: {
      awaiting: false,
      next: nextSunrise,
      remaining: nextSunrise.diffNow(),
    }
  };
};

const initialState : Sun = getInitialState();

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateSeason, (state, { payload }) => {
      state.season = payload;
    })
);
