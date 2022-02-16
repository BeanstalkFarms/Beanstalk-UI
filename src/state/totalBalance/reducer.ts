import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import { setTotalBalance } from './actions';

export interface TotalBalanceState {
  /**  */
  totalBeans: BigNumber;
  /**  */
  totalSiloBeans: BigNumber;
  /**  */
  totalTransitBeans: BigNumber;
  /**  */
  totalBudgetBeans: BigNumber;
  /**  */
  totalCurveBeans: BigNumber;
  /**  */
  totalSiloCurve: BigNumber;
  /**  */
  totalTransitCurve: BigNumber;
  /**  */
  totalLP: BigNumber;
  /**  */
  totalSiloLP: BigNumber;
  /** */
  totalTransitLP: BigNumber;
  /**  */
  totalStalk: BigNumber;
  /**  */
  totalSeeds: BigNumber;
  /**  */
  totalPods: BigNumber;
  /** @publius could you write up an explanation of a 'root'? */
  totalRoots: BigNumber;
  /**  */
  harvestableBeansPerSeason7: BigNumber;
  /**  */
  harvestableBeansPerSeason30: BigNumber;
  /**  */
  withdrawSeasons: BigNumber;
}

export const initialState: TotalBalanceState = {
  totalBeans: new BigNumber(-1),
  totalSiloBeans: new BigNumber(-1),
  totalTransitBeans: new BigNumber(-1),
  totalBudgetBeans: new BigNumber(-1),
  totalCurveBeans: new BigNumber(-1),
  totalSiloCurve: new BigNumber(-1),
  totalTransitCurve: new BigNumber(-1),
  totalLP: new BigNumber(-1),
  totalSiloLP: new BigNumber(-1),
  totalTransitLP: new BigNumber(-1),
  totalStalk: new BigNumber(-1),
  totalSeeds: new BigNumber(-1),
  totalPods: new BigNumber(-1),
  totalRoots: new BigNumber(-1),
  harvestableBeansPerSeason7: new BigNumber(-1),
  harvestableBeansPerSeason30: new BigNumber(-1),
  withdrawSeasons: new BigNumber(-1),
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setTotalBalance, (state, { payload }) => {
    Object.keys(payload).map((key) => {
      state[key] = payload[key];
      return state[key];
    });
  })
);
