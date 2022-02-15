import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import { setWeather } from './actions';

// @publius
// All the variables required for tracking and predicting the weather changes.
// Reccomend you refer to Section 8 in the Whitepaper for more clarity.
export interface WeatherState {
  /** Whether someone sowed below the minimum soil last Season */
  didSowBelowMin: Boolean;
  /** Whether someone sowed below minimum soil this Season faster than last Season */
  didSowFaster: Boolean;
  /** The delta Soil last season */
  lastDSoil: BigNumber;
  /** The % change in demand for Soil last season */
  lastSoilPercent: BigNumber;
  /** The last sow time in the previous Season */
  lastSowTime: BigNumber;
  /** The last sow time in the current Season */
  nextSowTime: BigNumber;
  /** The soil at the start of the current Season */
  startSoil: BigNumber;
  /** The current soil */
  soil: BigNumber;
  /** The harvestable index */
  harvestableIndex: BigNumber;
  /** The weather */
  weather: BigNumber;
  /** Whether it is raining or not. */
  raining: Boolean;
  /** The season that it started raining. */
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
