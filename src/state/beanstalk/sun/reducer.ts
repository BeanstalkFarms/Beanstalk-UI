import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { getNextExpectedSunrise, Sun } from '.';
import { 
  setNextSunrise,
  setRemainingUntilSunrise,
  setAwaitingSunrise,
  updateSeason,
  resetSun
} from './actions';

const NEG1 = new BigNumber(-1);

const getInitialState = () => {
  const nextSunrise = getNextExpectedSunrise(false);
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
    .addCase(setAwaitingSunrise, (state, { payload }) => {
      state.sunrise.awaiting = payload;
    })
    .addCase(setNextSunrise, (state, { payload }) => {
      state.sunrise.next = payload;
    })
    .addCase(setRemainingUntilSunrise, (state, { payload }) => {
      state.sunrise.remaining = payload;
    })
    .addCase(resetSun, () => getInitialState())
);
