import { createReducer } from '@reduxjs/toolkit';
import {
  setBeansPerSeason,
} from './actions';

export interface BeansPerSeasonState {
  farmableWeek: Number;
  farmableMonth: Number;
  harvestableWeek: Number;
  harvestableMonth: Number;
}

export const initialState: BeansPerSeasonState = {
  farmableWeek: 0,
  farmableMonth: 0,
  harvestableWeek: 0,
  harvestableMonth: 0,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setBeansPerSeason, (state, { payload }) => {
      Object.keys(payload).map((key) => {
        state[key] = payload[key];
        return state[key];
      });
    })
);
