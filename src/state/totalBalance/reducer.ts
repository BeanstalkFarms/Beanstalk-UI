import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import { setTotalBalance } from './actions';

export interface TotalBalanceState {
  /** The total Bean Supply */
  totalBeans: BigNumber;
  /** The total number of beans in the Silo */
  totalSiloBeans: BigNumber;
  /** Transit is Withdrawn, The total number of Withdrawn Beans */
  totalTransitBeans: BigNumber;
  /** The total number of Beans in Budgets (There are 4) */
  totalBudgetBeans: BigNumber;
  /** The total number of Beans in the curve pool */
  totalCurveBeans: BigNumber;
  /** */
  totalCrv3: BigNumber;
  /** The total number of Bean:3CRV LP tokens deposited in the Silo */
  totalSiloCurve: BigNumber;
  /** The total number of withdrawn Bean:3CRV LP tokens */
  totalTransitCurve: BigNumber;
  /** The total number of LP tokens */
  totalLP: BigNumber;
  /** The total number of LP tokens in the Silo */
  totalSiloLP: BigNumber;
  /** The total number of withdrawn LP Tokens */
  totalTransitLP: BigNumber;
  /** The total number of Stalk */
  totalStalk: BigNumber;
  /** The total number of Seeds */
  totalSeeds: BigNumber;
  /** The total number of Pods */
  totalPods: BigNumber;
  /**
   * Roots are an internal accounting variable used to track Farmable Beans/Stalk/Seeds
   * Roots represent actual ownership of the system under the hood.
   * Roots are gained when you deposit or collect Grown Stalk. Roots are lost when you withdraw
   * When you update your Silo, Beanstalk solves userRoots / totalRoots = userStalk / totalStalk for userStalk and uses that to calculate Farmable Stalk and other farmable assets
   * Voting takes place in roots cause its cheaper
   */
  totalRoots: BigNumber;
  /** The average # of Harvestable Beans per Season over the last 7 days */
  harvestableBeansPerSeason7: BigNumber;
  /** The average # of Harvestable Beans per Season over the last 30 days */
  harvestableBeansPerSeason30: BigNumber;
  /** The number of seasons a farmer has to wait for a withdrawl to post */
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
    Object.keys(payload).forEach((key) => {
      state[key] = payload[key];
    });
  })
);
