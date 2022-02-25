import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import {
  setUserBalance,
} from './actions';
import { Listing, BuyOffer } from './updater';

/** @publius  */
export interface UserBalanceState {
  /** The farmer's Ether balance */
  ethBalance: BigNumber;
  /** The Farmer's claimable Eth balance from Seasons of Plenty */
  claimableEthBalance: BigNumber;
  /** The farmer's balance of circulating Bean balance */
  beanBalance: BigNumber;
  /** The farmer's balance of Deposited Beans in the Silo */
  beanSiloBalance: BigNumber;
  /** The farmer's balance of Claimable Beans from Withdrawals */
  beanReceivableBalance: BigNumber;
  /** The farmer's balance of withdrawn Beans */
  beanTransitBalance: BigNumber;
  /** The farmer's balance of wrapped Beans in the Beanstalk contract */
  beanWrappedBalance: BigNumber;
  /** The farmer's circulating balance of LP Tokens */
  lpBalance: BigNumber;
  /** The farmer's balance of Deposit LP Tokens */
  lpSiloBalance: BigNumber;
  /** The farmer's balance of Withdrawn LP Tokens */
  lpTransitBalance: BigNumber;
  /** The farmer's balance of claimable LP Tokens from withdrawals */
  lpReceivableBalance: BigNumber;
  /** The farmer's balance of Stalk */
  stalkBalance: BigNumber;
  /** The farmer's balance of Seeds */
  seedBalance: BigNumber;
  /** The farmer's balance of Pods */
  podBalance: BigNumber;
  /** The farmer's balance of harvestable Pods */
  harvestablePodBalance: BigNumber;
  /** A mapping of the farmer's Bean Deposits mapping from season to Beans including the Deposit attributed to farmable Beans (When farmer's update their Silo, Farmable Beans are deposited in the most recent Season */
  beanDeposits: Object;
  /** A mapping of the farmer's Bean Deposits mapping from season to Beans excluding the Deposit attributed to farmable Beans */
  rawBeanDeposits: Object;
  /** A mapping of the farmer's Bean Withdrawals mapping from season to Beans excluding claimable Withdrawals */
  beanWithdrawals: Object;
  /** A mapping of the farmer's Bean Claimable Withdrawals mapping from season to Beans */
  beanReceivableCrates: Object;
  /** A mapping of the farmer's LP Deposits mapping from Season to LP. */
  lpDeposits: Object;
  /** A mapping of the Seeds awarded to each LP Deposit in lpDeposits from Season to LPSeeds. There should exist a mapping in lpSeedDeposits for each mapping in lpDeposits */
  lpSeedDeposits: Object;
  /** A mapping of the farmer's LP Withdrawals */
  lpWithdrawals: Object;
  /** A mapping of the farmer's claimable LP Withdrawals */
  lpReceivableCrates: Object;
  /**  */
  /** Plots are keyed by plotIndex, value is size of the Plot in Pods. */
  /**  */
  plots: { [plotIndex: string]: BigNumber };
  /** A mapping of the farmer's harvestable plots. */
  harvestablePlots: Object;
  /** A list of the BIPs the farmer has voted on. */
  votedBips: Object;
  /** @publius Depreciated. a boolean denoting whether the Farmer has an active vote. Farmer's used to be unable to withdraw when they were locked, so this variable was used to lock the modules */
  locked: Boolean;
  /** @publius Depreciated. The number of Seasons the Farmer is locked for. (Until the end of the BIPs they voted for) */
  lockedSeasons: BigNumber;
  /** @publius The sum of BeanRecievableBalance + beanHarvestableBalance + wrappedBeans */
  beanClaimableBalance: BigNumber;
  /** @publius The farmer's claimable struct. This struct is kind of complex to build and gets passed into a lot of functions, so we found it easiest to store in the state.
   * struct Claim {
   *    uint32[] beanWithdrawals;
   *    uint32[] lpWithdrawals;
   *    uint256[] plots;
   *    bool claimEth;
   *    bool convertLP;
   *    uint256 minBeanAmount;
   *    uint256 minEthAmount;
   *    bool toWallet;
   * }
  */
  claimable: Array;
  /** Whether the farmer has any type of claimable balance (Beans, LP, Eth) */
  hasClaimable: Boolean;
  /** The number of Farmable Beans the farmer has. */
  farmableBeanBalance: BigNumber;
  /** The number of Grown Stalk the farmer has. */
  grownStalkBalance: BigNumber;
  /** The number of Roots the farmer has. */
  rootsBalance: BigNumber;
  /** A farmer's pod listings. */
  listings: Listing[];
  /** A farmer's pod orders. */
  buyOffers: BuyOffer[];
  /** A farmer's balance of USDC. */
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
  listings: [],
  buyOffers: [],
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
