import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import { setWeather } from './actions';

// @publius
export interface WeatherState {
  didSowBelowMin: Boolean;
  didSowFaster: Boolean;
  lastDSoil: BigNumber;
  lastSoilPercent: BigNumber;
  lastSowTime: BigNumber;
  nextSowTime: BigNumber;
  startSoil: BigNumber;
  soil: BigNumber;
  harvestableIndex: BigNumber;
  weather: BigNumber;
  raining: Boolean;
  rainStart: BigNumber;
}

export const initialState: WeatherState = {
  didSowBelowMin: false,
  didSowFaster: false,
  lastDSoil: new BigNumber(-1),
  lastSoilPercent: new BigNumber(-1),
  lastSowTime: new BigNumber(-1),
  nextSowTime: new BigNumber(-1),
  startSoil: new BigNumber(-1),
  soil: new BigNumber(-1),
  harvestableIndex: new BigNumber(-1),
  weather: new BigNumber(-1),
  raining: false,
  rainStart: new BigNumber(-1),
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setWeather, (state, { payload }) => {
    Object.keys(payload).map((key) => {
      state[key] = payload[key];
      return state[key];
    });
  })
);
