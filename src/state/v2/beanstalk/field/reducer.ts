import { createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BeanstalkField } from '.';
import { resetBeanstalkField, updateBeanstalkField, updateHarvestableIndex } from './actions';

const initialState : BeanstalkField = {
  harvestableIndex: new BigNumber(-1),
  podIndex: new BigNumber(-1),
  totalPods: new BigNumber(-1),
  soil: new BigNumber(-1),
  weather: {
    didSowBelowMin: false,
    didSowFaster: false,
    lastDSoil: new BigNumber(-1),
    lastSoilPercent: new BigNumber(-1),
    lastSowTime: new BigNumber(-1),
    nextSowTime: new BigNumber(-1),
    startSoil: new BigNumber(-1),
    yield: new BigNumber(-1),
  },
  // FIXME: move under Weather?
  rain: {
    raining: false,
    rainStart: new BigNumber(-1),
  },
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetBeanstalkField, () => initialState)
    .addCase(updateBeanstalkField, (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state[key] = payload[key];
      });
    })
    .addCase(updateHarvestableIndex, (state, { payload }) => {
      state.harvestableIndex = payload;
    })
);
