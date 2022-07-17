import { useCallback, useMemo } from 'react';
import BigNumber from 'bignumber.js';

import { PlotMap, SeasonMap } from 'state/farmer/field';
import { toTokenUnitsBN } from 'util/Tokens';
import {
  BEAN,
  BEAN_ETH_UNIV2_LP,
  BEAN_CRV3_LP,
  BEAN_LUSD_LP,
} from 'constants/tokens';
import { useGetChainConstant } from 'hooks/useChainConstant';
import { ERC20Token } from 'classes/Token';
import { Event } from 'lib/Beanstalk/EventProcessor';

// ------------------------------------
// Types
// ------------------------------------

export type EventParsingParameters = {
  account: string;
  season: BigNumber;
  farmableBeans: BigNumber;
  harvestableIndex: BigNumber;
};

export type EventParsingTokens = {
  Bean: ERC20Token;
  BeanEthLP: ERC20Token;
  BeanCrv3LP: ERC20Token;
  BeanLusdLP: ERC20Token;
};

// ------------------------------------
// Types from the prior codebase -
// needs to be refactored!
// ------------------------------------

/**
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
 * IN REDUX STATE: claimable: [[], [], [], false, false, '0', '0'],
 */
type Claimable = [
  beanWithdrawals: any[],
  lpWithdrawals: any[],
  plots: any[],
  claimEth: boolean,
  convertLP: boolean,
  minBeanAmount: any,
  minEthAmount: any
  // toWallet is used in claimable calls but not included here
];

export type Deposits = SeasonMap<BigNumber>;
export type Withdrawals = SeasonMap<BigNumber>;

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
  /** @publius */
  curveBalance: BigNumber;
  /** @publius */
  curveSiloBalance: BigNumber;
  /** @publius */
  curveTransitBalance: BigNumber;
  /** @publius */
  curveReceivableBalance: BigNumber;
  /** @publius */
  beanlusdBalance: BigNumber;
  /** @publius */
  beanlusdSiloBalance: BigNumber;
  /** @publius */
  beanlusdTransitBalance: BigNumber;
  /** @publius */
  beanlusdReceivableBalance: BigNumber;
  /** @publius */
  /** The farmer's balance of Stalk */
  stalkBalance: BigNumber;
  /** The farmer's balance of Seeds */
  seedBalance: BigNumber;
  /** The farmer's balance of Pods */
  podBalance: BigNumber;
  /** The farmer's balance of harvestable Pods */
  harvestablePodBalance: BigNumber;
  /**
   * A mapping of the farmer's Bean Deposits mapping from season to Beans
   * including the Deposit attributed to farmable Beans (When farmer's update
   * their Silo, Farmable Beans are deposited in the most recent Season
   */
  beanDeposits: Deposits;
  /**
   * A mapping of the farmer's Bean Deposits mapping from season to Beans
   * excluding the Deposit attributed to farmable Beans
   */
  rawBeanDeposits: Deposits;
  /**
   * A mapping of the farmer's Bean Withdrawals mapping from season to Beans
   * excluding claimable Withdrawals
   */
  beanWithdrawals: Withdrawals;
  /**
   * A mapping of the farmer's Bean Claimable Withdrawals mapping from season to Beans
   */
  beanReceivableCrates: Withdrawals;
  /**
   * A mapping of the farmer's LP Deposits mapping from Season to LP.
   */
  lpDeposits: Deposits;
  /**
   * A mapping of the Seeds awarded to each LP Deposit in lpDeposits from
   * Season to LPSeeds. There should exist a mapping in lpSeedDeposits for
   * each mapping in lpDeposits.
   */
  lpSeedDeposits: Deposits;
  /**
   * A mapping of the farmer's LP Withdrawals
   */
  lpWithdrawals: Withdrawals;
  /**
   * A mapping of the farmer's claimable LP Withdrawals
   */
  lpReceivableCrates: Withdrawals;

  /** @publius */
  curveDeposits: Deposits;

  /** @publius */
  curveBDVDeposits: Deposits;

  /** @publius */
  curveWithdrawals: Withdrawals;

  /** @publius */
  curveReceivableCrates: Withdrawals;

  /** @publius */
  beanlusdDeposits: Deposits;

  /** @publius */
  beanlusdBDVDeposits: Deposits;

  /** @publius */
  beanlusdWithdrawals: Withdrawals;

  /** @publius */
  beanlusdReceivableCrates: Withdrawals;

  /**
   * Plots are keyed by plotIndex, value is size of the Plot in Pods.
   */
  plots: PlotMap<BigNumber>;
  /**
   * A mapping of the farmer's harvestable plots.
   */
  harvestablePlots: PlotMap<BigNumber>;
  /**
   * A Set of the BIPs the farmer has voted on.
   */
  votedBips: Set<any>;
  /** @DEPRECATED. a boolean denoting whether the Farmer has an active vote. Farmer's used to be unable to withdraw when they were locked, so this variable was used to lock the modules */
  // locked: Boolean;
  /** @DEPRECATED. The number of Seasons the Farmer is locked for. (Until the end of the BIPs they voted for) */
  // lockedSeasons: BigNumber;
  /** The sum of BeanRecievableBalance + beanHarvestableBalance + wrappedBeans */
  beanClaimableBalance: BigNumber;
  /**
   * The farmer's claimable struct. This struct is kind of complex to build and gets passed into
   * a lot of functions, so we found it easiest to store in the state.
   */
  claimable: Claimable;
  /** Whether the farmer has any type of claimable balance (Beans, LP, Eth) */
  hasClaimable: boolean;
  /** The number of Farmable Beans the farmer has. */
  farmableBeanBalance: BigNumber;
  /** The number of Grown Stalk the farmer has. */
  grownStalkBalance: BigNumber;
  /** The number of Roots the farmer has. */
  rootsBalance: BigNumber;
  /** A farmer's pod listings. */
  // listings: PodListing[];
  /** A farmer's pod orders. */
  // buyOffers: PodOrder[];
  /** A farmer's balance of USDC. */
  usdcBalance: BigNumber;
}

// ------------------------------------
// Helper functions: Crates
// ------------------------------------

export function addRewardedCrates(
  crates: { [season: number]: BigNumber },
  season: any,
  rewardedBeans: BigNumber
) {
  if (rewardedBeans.isEqualTo(0)) return crates;
  const ds = parseInt(season, 10);
  const isTopCrate =
    crates[ds] !== undefined
      ? crates[ds].isEqualTo(new BigNumber(rewardedBeans))
      : false;

  crates[ds] =
    crates[ds] === undefined
      ? rewardedBeans
      : isTopCrate
      ? crates[ds]
      : crates[ds].plus(rewardedBeans);
  return crates;
}

// ------------------------------------
// Helper functions: Plots
// ------------------------------------

export function parsePlots(
  plots: PlotMap<BigNumber>,
  index: BigNumber
): [
  pods: BigNumber,
  harvestablePods: BigNumber,
  unharvestablePlots: any,
  harvestablePlots: any
] {
  let pods = new BigNumber(0);
  let harvestablePods = new BigNumber(0);
  const unharvestablePlots: PlotMap<BigNumber> = {};
  const harvestablePlots: PlotMap<BigNumber> = {};
  Object.keys(plots).forEach((p) => {
    if (plots[p].plus(p).isLessThanOrEqualTo(index)) {
      harvestablePods = harvestablePods.plus(plots[p]);
      harvestablePlots[p] = plots[p];
    } else if (new BigNumber(p).isLessThan(index)) {
      harvestablePods = harvestablePods.plus(index.minus(p));
      pods = pods.plus(plots[p].minus(index.minus(p)));
      harvestablePlots[p] = index.minus(p);
      unharvestablePlots[index.minus(p).plus(p).toString()] = plots[p].minus(
        index.minus(p)
      );
    } else {
      pods = pods.plus(plots[p]);
      unharvestablePlots[p] = plots[p];
    }
  });

  return [pods, harvestablePods, unharvestablePlots, harvestablePlots];
}

// ------------------------------------
// Event processing logic
// ------------------------------------

function _processFarmerEvents(
  events: Event[],
  params: EventParsingParameters,
  tokens: EventParsingTokens
) {
  const {
    Bean,
    BeanEthLP,
    BeanCrv3LP,
    // BeanLusdLP,
  } = tokens;

  // These get piped into redux 1:1 and so need to match
  // the type defined in UserBalanceState.
  let userLPSeedDeposits: UserBalanceState['lpSeedDeposits'] = {};
  let userLPDeposits: UserBalanceState['lpDeposits'] = {};
  let lpWithdrawals: UserBalanceState['lpWithdrawals'] = {};
  let userCurveDeposits: UserBalanceState['curveDeposits'] = {};
  let userCurveBDVDeposits: UserBalanceState['curveBDVDeposits'] = {};
  let curveWithdrawals: UserBalanceState['curveWithdrawals'] = {};
  let userBeanlusdDeposits: UserBalanceState['beanlusdDeposits'] = {};
  let userBeanlusdBDVDeposits: UserBalanceState['beanlusdBDVDeposits'] = {};
  let beanlusdWithdrawals: UserBalanceState['beanlusdWithdrawals'] = {};
  let userPlots: UserBalanceState['plots'] = {};
  let userBeanDeposits: UserBalanceState['beanDeposits'] = {};
  let beanWithdrawals: UserBalanceState['beanWithdrawals'] = {};
  const votedBips: UserBalanceState['votedBips'] = new Set();

  events.forEach((event) => {
    if (event.event === 'BeanDeposit') {
      // `season` is a base-10 numerical string.
      const s = parseInt(event.returnValues.season, 10);
      // numbers on Etherum are always returned as ints,
      // so this conversion turns `returnValues.beans`
      const beans = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        Bean.decimals
      );
      // Override the bean deposit for season `s`.
      // If a prior deposit exists, add `beans` to that
      // deposit. Otherwise, a new item is created.
      userBeanDeposits = {
        ...userBeanDeposits,
        [s]:
          userBeanDeposits[s] !== undefined
            ? userBeanDeposits[s].plus(beans)
            : beans,
      };
      if (userBeanDeposits[s].isEqualTo(0)) delete userBeanDeposits[s];
    }
    // BeanRemove is removing a deposit. It's issued at the same time as a
    // Withdrawal. During convert you remove Deposits but don't Withdraw.
    else if (event.event === 'BeanRemove') {
      // FIXME: define crates contract return value
      event.returnValues.crates.forEach((s: string, i: number) => {
        const beans = toTokenUnitsBN(
          event.returnValues.crateBeans[i],
          Bean.decimals
        );
        userBeanDeposits = {
          ...userBeanDeposits,
          [s]:
            userBeanDeposits[s] !== undefined
              ? userBeanDeposits[s].minus(beans)
              : beans,
        };
        if (userBeanDeposits[s].isEqualTo(0)) delete userBeanDeposits[s];
      });
    } else if (event.event === 'BeanWithdraw') {
      const s = parseInt(event.returnValues.season, 10);
      const beans = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        Bean.decimals
      );
      beanWithdrawals = {
        ...beanWithdrawals,
        [s]:
          beanWithdrawals[s] !== undefined
            ? beanWithdrawals[s].plus(beans)
            : beans,
      };
    } else if (event.event === 'Sow') {
      const s = toTokenUnitsBN(
        new BigNumber(event.returnValues.index),
        Bean.decimals
      );
      userPlots[s.toString()] = toTokenUnitsBN(
        event.returnValues.pods,
        Bean.decimals // QUESTION: why is this BEAN.decimals and not PODS? are they the same?
      );
    } else if (event.event === 'PlotTransfer') {
      // The account received a Plot
      if (event.returnValues.to.toLowerCase() === params.account) {
        const index = toTokenUnitsBN(
          new BigNumber(event.returnValues.id),
          Bean.decimals
        );
        userPlots[index.toString()] = toTokenUnitsBN(
          event.returnValues.pods,
          Bean.decimals
        );
      }
      // The account sent a Plot
      else {
        // Numerical "index" of the plot.
        // Absolute, with respect to Pod 0.
        const index = toTokenUnitsBN(
          new BigNumber(event.returnValues.id),
          Bean.decimals
        );
        // String version of `idx`, used to key
        // objects. This prevents duplicate toString() calls
        // and resolves Typescript errors.
        const indexStr = index.toString();
        // Size of the Plot, in pods
        const pods = toTokenUnitsBN(
          new BigNumber(event.returnValues.pods),
          Bean.decimals
        );

        let i = 0;
        let found = false;

        // If we've located the plot in a prior event
        if (userPlots[indexStr] !== undefined) {
          // Send partial plot
          if (!pods.isEqualTo(userPlots[indexStr])) {
            const newStartIndex = index.plus(pods);
            userPlots[newStartIndex.toString()] =
              userPlots[indexStr].minus(pods);
          }
          delete userPlots[indexStr];
        }

        // QUESTION: what's going on here?
        // FIXME: lots of Object.keys calls while the array itself is being
        // modified.
        else {
          while (found === false && i < Object.keys(userPlots).length) {
            const startIndex = new BigNumber(Object.keys(userPlots)[i]);
            const endIndex = new BigNumber(
              startIndex.plus(userPlots[startIndex.toString()])
            );
            if (
              startIndex.isLessThanOrEqualTo(index) &&
              endIndex.isGreaterThan(index)
            ) {
              userPlots[startIndex.toString()] = new BigNumber(
                index.minus(startIndex)
              );
              if (!index.isEqualTo(endIndex)) {
                const s2 = index.plus(pods);
                if (!s2.isEqualTo(endIndex)) {
                  const s2Str = s2.toString();
                  userPlots[s2Str] = endIndex.minus(s2);
                  if (userPlots[s2Str].isEqualTo(0)) delete userPlots[s2Str];
                }
              }
              found = true;
            }
            i += 1;
          }
        }
      }
    } else if (event.event === 'LPDeposit') {
      const s = parseInt(event.returnValues.season, 10);
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.lp),
        BeanEthLP.decimals
      );
      const seeds = toTokenUnitsBN(
        new BigNumber(event.returnValues.seeds),
        Bean.decimals
      );
      userLPDeposits = {
        ...userLPDeposits,
        [s]: userLPDeposits[s] !== undefined ? userLPDeposits[s].plus(lp) : lp,
      };
      userLPSeedDeposits = {
        ...userLPSeedDeposits,
        [s]:
          userLPSeedDeposits[s] !== undefined
            ? userLPSeedDeposits[s].plus(seeds)
            : seeds,
      };
    } else if (event.event === 'LPRemove') {
      event.returnValues.crates.forEach((s: string, i: number) => {
        const lp = toTokenUnitsBN(
          event.returnValues.crateLP[i],
          BeanEthLP.decimals
        );
        const seeds = userLPSeedDeposits[s]
          .multipliedBy(lp)
          .dividedBy(userLPDeposits[s]);
        userLPDeposits = {
          ...userLPDeposits,
          [s]: userLPDeposits[s].minus(lp),
        };
        userLPSeedDeposits = {
          ...userLPSeedDeposits,
          [s]: userLPSeedDeposits[s].minus(seeds),
        };
        console.debug(
          '[processor:event/LPRemove]',
          userLPDeposits[s].toNumber(),
          userLPSeedDeposits[s].toNumber(),
          event
        );
        if (userLPDeposits[s].isEqualTo(0)) delete userLPDeposits[s];
        if (userLPSeedDeposits[s].isEqualTo(0)) {
          delete userLPSeedDeposits[s];
        }
      });
    } else if (event.event === 'LPWithdraw') {
      const s = parseInt(event.returnValues.season, 10);
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.lp),
        BeanEthLP.decimals
      );
      lpWithdrawals = {
        ...lpWithdrawals,
        [s]: lpWithdrawals[s] !== undefined ? lpWithdrawals[s].plus(lp) : lp,
      };
    } else if (event.event === 'Deposit') {
      const s = parseInt(event.returnValues.season, 10);
      const t = event.returnValues.token.toLowerCase();
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.amount),
        BeanEthLP.decimals
      );
      const bdv = toTokenUnitsBN(
        new BigNumber(event.returnValues.bdv),
        Bean.decimals
      );
      if (t === BeanCrv3LP.address.toLowerCase()) {
        userCurveDeposits = {
          ...userCurveDeposits,
          [s]:
            userCurveDeposits[s] !== undefined
              ? userCurveDeposits[s].plus(lp)
              : lp,
        };
        userCurveBDVDeposits = {
          ...userCurveBDVDeposits,
          [s]:
            userCurveBDVDeposits[s] !== undefined
              ? userCurveBDVDeposits[s].plus(bdv)
              : bdv,
        };
      } else {
        userBeanlusdDeposits = {
          ...userBeanlusdDeposits,
          [s]:
            userBeanlusdDeposits[s] !== undefined
              ? userBeanlusdDeposits[s].plus(lp)
              : lp,
        };
        userBeanlusdBDVDeposits = {
          ...userBeanlusdBDVDeposits,
          [s]:
            userBeanlusdBDVDeposits[s] !== undefined
              ? userBeanlusdBDVDeposits[s].plus(bdv)
              : bdv,
        };
      }
    } else if (event.event === 'RemoveSeason') {
      const s = parseInt(event.returnValues.season, 10);
      const t = event.returnValues.token.toLowerCase();
      const amount = toTokenUnitsBN(
        event.returnValues.amount,
        BeanEthLP.decimals
      );
      if (t === BeanCrv3LP.address.toLowerCase()) {
        const bdv = userCurveBDVDeposits[s]
          .multipliedBy(amount)
          .dividedBy(userCurveDeposits[s]);
        userCurveDeposits = {
          ...userCurveDeposits,
          [s]: userCurveDeposits[s].minus(amount),
        };
        userCurveBDVDeposits = {
          ...userCurveBDVDeposits,
          [s]: userCurveBDVDeposits[s].minus(bdv),
        };
        if (userCurveDeposits[s].isEqualTo(0)) delete userCurveDeposits[s];
        if (userCurveBDVDeposits[s].isEqualTo(0))
          delete userCurveBDVDeposits[s];
      } else {
        const bdv = userBeanlusdBDVDeposits[s]
          .multipliedBy(amount)
          .dividedBy(userBeanlusdBDVDeposits[s]);
        userBeanlusdBDVDeposits = {
          ...userBeanlusdBDVDeposits,
          [s]: userBeanlusdBDVDeposits[s].minus(amount),
        };
        userBeanlusdBDVDeposits = {
          ...userBeanlusdBDVDeposits,
          [s]: userBeanlusdBDVDeposits[s].minus(bdv),
        };
        if (userBeanlusdDeposits[s].isEqualTo(0))
          delete userBeanlusdDeposits[s];
        if (userBeanlusdBDVDeposits[s].isEqualTo(0))
          delete userBeanlusdBDVDeposits[s];
      }
    } else if (event.event === 'RemoveSeasons') {
      const t = event.returnValues.token.toLowerCase();
      event.returnValues.seasons.forEach((s: string, i: number) => {
        const lp = toTokenUnitsBN(
          event.returnValues.amounts[i],
          BeanEthLP.decimals
        );
        if (t === BeanCrv3LP.address.toLowerCase()) {
          const bdv = userCurveBDVDeposits[s]
            .multipliedBy(lp)
            .dividedBy(userCurveDeposits[s]);
          userCurveDeposits = {
            ...userCurveDeposits,
            [s]: userCurveDeposits[s].minus(lp),
          };
          userCurveBDVDeposits = {
            ...userCurveBDVDeposits,
            [s]: userCurveBDVDeposits[s].minus(bdv),
          };
          if (userCurveDeposits[s].isEqualTo(0)) delete userCurveDeposits[s];
          if (userCurveBDVDeposits[s].isEqualTo(0))
            delete userCurveBDVDeposits[s];
        } else {
          const bdv = userBeanlusdBDVDeposits[s]
            .multipliedBy(lp)
            .dividedBy(userBeanlusdDeposits[s]);
          userBeanlusdDeposits = {
            ...userBeanlusdDeposits,
            [s]: userBeanlusdDeposits[s].minus(lp),
          };
          userBeanlusdBDVDeposits = {
            ...userBeanlusdBDVDeposits,
            [s]: userBeanlusdBDVDeposits[s].minus(bdv),
          };
          if (userBeanlusdDeposits[s].isEqualTo(0))
            delete userBeanlusdDeposits[s];
          if (userBeanlusdBDVDeposits[s].isEqualTo(0))
            delete userBeanlusdBDVDeposits[s];
        }
      });
    } else if (event.event === 'Withdraw') {
      const s = parseInt(event.returnValues.season, 10);
      const t = event.returnValues.token.toLowerCase();
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.amount),
        BeanEthLP.decimals
      );
      if (t === BeanCrv3LP.address.toLowerCase()) {
        curveWithdrawals = {
          ...curveWithdrawals,
          [s]:
            curveWithdrawals[s] !== undefined
              ? curveWithdrawals[s].plus(lp)
              : lp,
        };
      } else {
        beanlusdWithdrawals = {
          ...beanlusdWithdrawals,
          [s]:
            beanlusdWithdrawals[s] !== undefined
              ? beanlusdWithdrawals[s].plus(lp)
              : lp,
        };
      }
    } else if (event.event === 'ClaimSeason') {
      const t = event.returnValues.token.toLowerCase();
      if (t === BeanCrv3LP.address.toLowerCase()) {
        delete curveWithdrawals[event.returnValues.season];
      } else {
        delete beanlusdWithdrawals[event.returnValues.season];
      }
    } else if (event.event === 'ClaimSeasons') {
      const t = event.returnValues.token.toLowerCase();
      if (t === BeanCrv3LP.address.toLowerCase()) {
        event.returnValues.seasons.forEach((s: string) => {
          delete curveWithdrawals[s];
        });
      } else {
        event.returnValues.seasons.forEach((s: string) => {
          delete beanlusdWithdrawals[s];
        });
      }
    } else if (event.event === 'Harvest') {
      let beansClaimed = toTokenUnitsBN(
        event.returnValues.beans,
        Bean.decimals
      );
      let plots = event.returnValues.plots
        .slice()
        .map((p: any) => toTokenUnitsBN(p, Bean.decimals)); // FIXME: what's the type of p
      plots = plots.sort((a: BigNumber, b: BigNumber) => a.minus(b));

      plots.forEach((index: string) => {
        if (beansClaimed.isLessThan(userPlots[index])) {
          const partialIndex = beansClaimed.plus(index);
          userPlots = {
            ...userPlots,
            [partialIndex.toString()]: userPlots[index].minus(beansClaimed),
          };
        } else {
          beansClaimed = beansClaimed.minus(userPlots[index]);
        }
        delete userPlots[index];
      });
    } else if (event.event === 'BeanClaim') {
      event.returnValues.withdrawals.forEach(
        (s: string) => delete beanWithdrawals[s]
      );
    } else if (event.event === 'LPClaim') {
      event.returnValues.withdrawals.forEach(
        (s: string) => delete lpWithdrawals[s]
      );
    } else if (event.event === 'Vote') {
      votedBips.add(event.returnValues.bip);
    } else if (event.event === 'Unvote') {
      votedBips.delete(event.returnValues.bip);
    }
  });

  //
  const zeroBN = new BigNumber(0);
  userBeanDeposits = addRewardedCrates(
    userBeanDeposits,
    params.season,
    params.farmableBeans
  );
  const beanDepositsBalance = Object.values(userBeanDeposits).reduce(
    (a, c) => a.plus(c),
    zeroBN
  );
  const lpDepositsBalance = Object.values(userLPDeposits).reduce(
    (a, c) => a.plus(c),
    zeroBN
  );
  const curveDepositsBalance = Object.values(userCurveDeposits).reduce(
    (a, c) => a.plus(c),
    zeroBN
  );
  const beanlusdDepositsBalance = Object.values(userBeanlusdDeposits).reduce(
    (a, c) => a.plus(c),
    zeroBN
  );
  const [podBalance, harvestablePodBalance, plots, harvestablePlots] =
    parsePlots(userPlots, params.harvestableIndex);

  return {
    // Bean
    userBeanDeposits, // crates
    beanWithdrawals, // crates
    beanDepositsBalance, // sum of deposits
    // LP
    userLPSeedDeposits, // crates where value is Seeds
    userLPDeposits, // crates
    lpWithdrawals, // crates
    lpDepositsBalance, // sum of deposits
    // Curve
    userCurveDeposits, // crates
    userCurveBDVDeposits, // crates where value is BDV
    curveWithdrawals, // crates
    curveDepositsBalance, // sum of deposits
    // BEAN:LUSD
    userBeanlusdDeposits, // crates
    userBeanlusdBDVDeposits, // crates where value is BDV
    beanlusdWithdrawals, // crates
    beanlusdDepositsBalance, // sum of deposits
    // Field
    userPlots, // raw plots data (?)
    podBalance, // sum of pods that are unharvestable
    harvestablePodBalance, // sum of pods that are harvestable
    plots, // parsed plots that are unharvestable
    harvestablePlots, // parsed plots that are harvestable
  };
}

// ------------------------------------
// Hooks
// ------------------------------------

export default function useEventProcessor() {
  const getChainConstant = useGetChainConstant();
  const Tokens = useMemo<EventParsingTokens>(
    () => ({
      // FIXME: cast these to the correct types
      // FIXME: duplicated from `processor.ts`
      Bean: getChainConstant(BEAN),
      BeanEthLP: getChainConstant(BEAN_ETH_UNIV2_LP),
      BeanCrv3LP: getChainConstant(BEAN_CRV3_LP),
      BeanLusdLP: getChainConstant(BEAN_LUSD_LP),
    }),
    [getChainConstant]
  );

  return useCallback(
    (events: Event[], params: EventParsingParameters) =>
      _processFarmerEvents(events, params, Tokens),
    [Tokens]
  );
}
