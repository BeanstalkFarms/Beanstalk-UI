import { createReducer } from '@reduxjs/toolkit';
import {
  setBeansPerSeason,
} from './actions';

export interface BeansPerSeasonState {
  farmableWeek: number;
  farmableMonth: number;
  harvestableWeek: number;
  harvestableMonth: number;
  //
  farmableMonthTotal: number;
}

export const initialState: BeansPerSeasonState = {
  farmableWeek: 0,
  farmableMonth: 0,
  harvestableWeek: 0,
  harvestableMonth: 0,
  //
  farmableMonthTotal: -1,
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
