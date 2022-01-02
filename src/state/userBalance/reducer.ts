import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import {
  setUserBalance,
} from './actions';

export interface UserBalanceState {
  ethBalance: BigNumber;
  claimableEthBalance: BigNumber;
  beanBalance: BigNumber;
  beanSiloBalance: BigNumber;
  beanReceivableBalance: BigNumber;
  beanTransitBalance: BigNumber;
  beanWrappedBalance: BigNumber;
  lpBalance: BigNumber;
  lpSiloBalance: BigNumber;
  lpTransitBalance: BigNumber;
  lpReceivableBalance: BigNumber;
  stalkBalance: BigNumber;
  seedBalance: BigNumber;
  podBalance: BigNumber;
  harvestablePodBalance: BigNumber;
  harvestableBalance: BigNumber;
  beanDeposits: Object;
  rawBeanDeposits: Object;
  beanWithdrawals: Object;
  beanReceivableCrates: Object;
  lpDeposits: Object;
  lpSeedDeposits: Object;
  lpWithdrawals: Object;
  lpReceivableCrates: Object;
  plots: Object;
  harvestablePlots: Object;
  votedBips: Object;
  locked: Boolean;
  lockedSeasons: BigNumber;
  beanClaimableBalance: BigNumber;
  claimable: Array;
  hasClaimable: Boolean;
  farmableBeanBalance: BigNumber;
  grownStalkBalance: BigNumber;
  rootsBalance: BigNumber;
  usdcBalance: BigNumber;
}

export const initialState: UserBalanceState = {
  ethBalance: new BigNumber(-1),
  claimableEthBalance: new BigNumber(-1),
  beanBalance: new BigNumber(-1),
  beanSiloBalance: new BigNumber(-1),
  beanReceivableBalance: new BigNumber(-1),
  beanTransitBalance: new BigNumber(-1),
  beanWrappedBalance: new BigNumber(-1),
  lpBalance: new BigNumber(-1),
  lpSiloBalance: new BigNumber(-1),
  lpTransitBalance: new BigNumber(-1),
  lpReceivableBalance: new BigNumber(-1),
  stalkBalance: new BigNumber(-1),
  seedBalance: new BigNumber(-1),
  podBalance: new BigNumber(-1),
  harvestablePodBalance: new BigNumber(-1),
  harvestableBalance: new BigNumber(-1),
  beanDeposits: {},
  rawBeanDeposits: {},
  beanWithdrawals: {},
  beanReceivableCrates: {},
  lpDeposits: {},
  lpSeedDeposits: {},
  lpWithdrawals: {},
  lpReceivableCrates: {},
  plots: {},
  harvestablePlots: {},
  votedBips: new Set(),
  locked: false,
  lockedSeasons: new BigNumber(-1),
  beanClaimableBalance: new BigNumber(-1),
  claimable: [[], [], [], false, false, '0', '0'],
  hasClaimable: false,
  farmableBeanBalance: new BigNumber(-1),
  grownStalkBalance: new BigNumber(-1),
  rootsBalance: new BigNumber(-1),
  usdcBalance: new BigNumber(-1),
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setUserBalance, (state, { payload }) => {
      Object.keys(payload).map((key) => {
        state[key] = payload[key];
        return state[key];
      });
    })
);
