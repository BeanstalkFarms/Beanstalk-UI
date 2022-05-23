import { GetAccountResult } from "@wagmi/core";
import BigNumber from "bignumber.js";
import { BEAN, CURVE, UNI_V2_ETH_BEAN_LP } from "constants/tokens";
import { UserBalanceState } from "state/userBalance/reducer";
import { ParsedEvent } from "state/v2/farmer/events/updater";
import { toTokenUnitsBN } from "./TokenUtilities";


// @publius to discuss: rename of crates
// "crate" = a Deposit or Withdrawal
export function addRewardedCrates(
  crates: { [season: number] : BigNumber },
  season: any,
  rewardedBeans: BigNumber
) {
  if (rewardedBeans.isEqualTo(0)) return crates;
  const ds = parseInt(season, 10);
  const isTopCrate = crates[ds] !== undefined
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

export function parsePlots(
  plots,
  index: BigNumber
) {
  let pods = new BigNumber(0);
  let harvestablePods = new BigNumber(0);
  const unharvestablePlots = {};
  const harvestablePlots = {};
  Object.keys(plots).forEach((p) => {
    if (plots[p].plus(p).isLessThanOrEqualTo(index)) {
      harvestablePods = harvestablePods.plus(plots[p]);
      harvestablePlots[p] = plots[p];
    } else if (new BigNumber(p).isLessThan(index)) {
      harvestablePods = harvestablePods.plus(index.minus(p));
      pods = pods.plus(plots[p].minus(index.minus(p)));
      harvestablePlots[p] = index.minus(p);
      unharvestablePlots[index.minus(p).plus(p)] = plots[p].minus(
        index.minus(p)
      );
    } else {
      pods = pods.plus(plots[p]);
      unharvestablePlots[p] = plots[p];
    }
  });

  return [pods, harvestablePods, unharvestablePlots, harvestablePlots];
}


export default function processFarmerEvents(
  events: ParsedEvent[],
  params: {
    account: string;
    season: BigNumber;
    farmableBeans: BigNumber;
  },
) {
  // These get piped into redux 1:1 and so need to match
  // the type defined in UserBalanceState.
  let userLPSeedDeposits : UserBalanceState['lpSeedDeposits'] = {};
  let userLPDeposits : UserBalanceState['lpDeposits'] = {};
  let lpWithdrawals : UserBalanceState['lpWithdrawals'] = {};
  let userCurveDeposits : UserBalanceState['curveDeposits'] = {};
  let userCurveBDVDeposits : UserBalanceState['curveBDVDeposits'] = {};
  let curveWithdrawals : UserBalanceState['curveWithdrawals'] = {};
  let userBeanlusdDeposits : UserBalanceState['beanlusdDeposits'] = {};
  let userBeanlusdBDVDeposits : UserBalanceState['beanlusdBDVDeposits'] = {};
  let beanlusdWithdrawals : UserBalanceState['beanlusdWithdrawals'] = {};
  let userPlots : UserBalanceState['plots'] = {};
  let userBeanDeposits : UserBalanceState['beanDeposits'] = {};
  let beanWithdrawals : UserBalanceState['beanWithdrawals'] = {};
  const votedBips : UserBalanceState['votedBips'] = new Set();
  
  events.forEach((event) => {
    console.debug(event)
    if (event.event === 'BeanDeposit') {
      // `season` is a base-10 numerical string.
      const s = parseInt(event.returnValues.season, 10);
      // numbers on Etherum are always returned as ints,
      // so this conversion turns `returnValues.beans`
      const beans = toTokenUnitsBN(
        new BigNumber(event.returnValues.beans),
        BEAN.decimals
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
    } else if (event.event === 'BeanRemove') {
      // FIXME: define crates contract return value
      event.returnValues.crates.forEach((s, i) => {
        const beans = toTokenUnitsBN(
          event.returnValues.crateBeans[i],
          BEAN.decimals
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
        BEAN.decimals
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
        BEAN.decimals
      );
      userPlots[s.toString()] = toTokenUnitsBN(
        event.returnValues.pods,
        BEAN.decimals // QUESTION: why is this BEAN.decimals and not PODS? are they the same?
      );
    } else if (event.event === 'PlotTransfer') {
      // The account received a Plot
      if (event.returnValues.to.toLowerCase() === params.account) {
        const index = toTokenUnitsBN(
          new BigNumber(event.returnValues.id),
          BEAN.decimals
        );
        userPlots[index.toString()] = toTokenUnitsBN(
          event.returnValues.pods,
          BEAN.decimals
        );
      }
      // The account sent a Plot
      else {
        // Numerical "index" of the plot.
        // Absolute, with respect to Pod 0.
        const index = toTokenUnitsBN(
          new BigNumber(event.returnValues.id),
          BEAN.decimals
        );
        // String version of `idx`, used to key
        // objects. This prevents duplicate toString() calls
        // and resolves Typescript errors.
        const indexStr = index.toString();
        // Size of the Plot, in pods
        const pods = toTokenUnitsBN(
          new BigNumber(event.returnValues.pods),
          BEAN.decimals
        );

        let i = 0;
        let found = false;

        // If we've located the plot in a prior event
        if (userPlots[indexStr] !== undefined) {
          // Send partial plot
          if (!pods.isEqualTo(userPlots[indexStr])) {
            const newStartIndex = index.plus(pods);
            userPlots[newStartIndex.toString()] = userPlots[indexStr].minus(pods);
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
            if (startIndex.isLessThanOrEqualTo(index) && endIndex.isGreaterThan(index)) {
              userPlots[startIndex.toString()] = new BigNumber(index.minus(startIndex));
              if (!index.isEqualTo(endIndex)) {
                const s2    = index.plus(pods);
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
        UNI_V2_ETH_BEAN_LP.decimals
      );
      const seeds = toTokenUnitsBN(
        new BigNumber(event.returnValues.seeds),
        BEAN.decimals
      );
      userLPDeposits = {
        ...userLPDeposits,
        [s]:
          userLPDeposits[s] !== undefined ? userLPDeposits[s].plus(lp) : lp,
      };
      userLPSeedDeposits = {
        ...userLPSeedDeposits,
        [s]:
          userLPSeedDeposits[s] !== undefined
            ? userLPSeedDeposits[s].plus(seeds)
            : seeds,
      };
    } else if (event.event === 'LPRemove') {
      event.returnValues.crates.forEach((s, i) => {
        const lp = toTokenUnitsBN(
          event.returnValues.crateLP[i],
          UNI_V2_ETH_BEAN_LP.decimals
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
        if (userLPDeposits[s].isEqualTo(0)) delete userLPDeposits[s];
        if (userLPSeedDeposits[s].isEqualTo(0)) {
          delete userLPSeedDeposits[s];
        }
      });
    } else if (event.event === 'LPWithdraw') {
      const s = parseInt(event.returnValues.season, 10);
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.lp),
        UNI_V2_ETH_BEAN_LP.decimals
      );
      lpWithdrawals = {
        ...lpWithdrawals,
        [s]:
          lpWithdrawals[s] !== undefined ? lpWithdrawals[s].plus(lp) : lp,
      };
    } else if (event.event === 'Deposit') {
      const s = parseInt(event.returnValues.season, 10);
      const t = event.returnValues.token;
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.amount),
        UNI_V2_ETH_BEAN_LP.decimals
      );
      const bdv = toTokenUnitsBN(
        new BigNumber(event.returnValues.bdv),
        BEAN.decimals
      );
      if (t === CURVE.addr) {
        userCurveDeposits = {
          ...userCurveDeposits,
          [s]:
            userCurveDeposits[s] !== undefined ? userCurveDeposits[s].plus(lp) : lp,
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
            userBeanlusdDeposits[s] !== undefined ? userBeanlusdDeposits[s].plus(lp) : lp,
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
      const t = event.returnValues.token;
      const lp = toTokenUnitsBN(
        event.returnValues.amount,
        UNI_V2_ETH_BEAN_LP.decimals
      );
      if (t === CURVE.addr) {
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
        if (userCurveBDVDeposits[s].isEqualTo(0)) delete userCurveBDVDeposits[s];
      } else {
        const bdv = userBeanlusdBDVDeposits[s]
          .multipliedBy(lp)
          .dividedBy(userBeanlusdBDVDeposits[s]);
        userBeanlusdBDVDeposits = {
          ...userBeanlusdBDVDeposits,
          [s]: userBeanlusdBDVDeposits[s].minus(lp),
        };
        userBeanlusdBDVDeposits = {
          ...userBeanlusdBDVDeposits,
          [s]: userBeanlusdBDVDeposits[s].minus(bdv),
        };
        if (userBeanlusdDeposits[s].isEqualTo(0)) delete userBeanlusdDeposits[s];
        if (userBeanlusdBDVDeposits[s].isEqualTo(0)) delete userBeanlusdBDVDeposits[s];
      }
    } else if (event.event === 'RemoveSeasons') {
      const t = event.returnValues.token;
      event.returnValues.seasons.forEach((s, i) => {
        const lp = toTokenUnitsBN(
          event.returnValues.amounts[i],
          UNI_V2_ETH_BEAN_LP.decimals
        );
        if (t === CURVE.addr) {
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
          if (userCurveBDVDeposits[s].isEqualTo(0)) delete userCurveBDVDeposits[s];
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
          if (userBeanlusdDeposits[s].isEqualTo(0)) delete userBeanlusdDeposits[s];
          if (userBeanlusdBDVDeposits[s].isEqualTo(0)) delete userBeanlusdBDVDeposits[s];
        }
      });
    } else if (event.event === 'Withdraw') {
      const s = parseInt(event.returnValues.season, 10);
      const t = event.returnValues.token;
      const lp = toTokenUnitsBN(
        new BigNumber(event.returnValues.amount),
        UNI_V2_ETH_BEAN_LP.decimals
      );
      if (t === CURVE.addr) {
        curveWithdrawals = {
          ...curveWithdrawals,
          [s]:
            curveWithdrawals[s] !== undefined ? curveWithdrawals[s].plus(lp) : lp,
        };
      } else {
        beanlusdWithdrawals = {
          ...beanlusdWithdrawals,
          [s]:
            beanlusdWithdrawals[s] !== undefined ? beanlusdWithdrawals[s].plus(lp) : lp,
        };
      }
    } else if (event.event === 'ClaimSeason') {
      const t = event.returnValues.token;
      if (t === CURVE.addr) {
        delete curveWithdrawals[event.returnValues.season];
      } else {
        delete beanlusdWithdrawals[event.returnValues.season];
      }
    } else if (event.event === 'ClaimSeasons') {
      const t = event.returnValues.token;
      if (t === CURVE.addr) {
        event.returnValues.seasons.forEach((s) => {
          delete curveWithdrawals[s];
        });
      } else {
        event.returnValues.seasons.forEach((s) => {
          delete beanlusdWithdrawals[s];
        });
      }
    } else if (event.event === 'Harvest') {
      let beansClaimed = toTokenUnitsBN(
        event.returnValues.beans,
        BEAN.decimals
      );
      let plots = event.returnValues.plots
        .slice()
        .map((p) => toTokenUnitsBN(p, BEAN.decimals));
      plots = plots.sort((a, b) => a.minus(b));

      plots.forEach((index) => {
        if (beansClaimed.isLessThan(userPlots[index])) {
          const partialIndex = beansClaimed.plus(index);
          userPlots = {
            ...userPlots,
            [partialIndex]: userPlots[index].minus(beansClaimed),
          };
        } else {
          beansClaimed = beansClaimed.minus(userPlots[index]);
        }
        delete userPlots[index];
      });
    } else if (event.event === 'BeanClaim') {
      event.returnValues.withdrawals.forEach(
        (s) => delete beanWithdrawals[s]
      );
    } else if (event.event === 'LPClaim') {
      event.returnValues.withdrawals.forEach(
        (s) => delete lpWithdrawals[s]
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
  console.debug(userBeanDeposits, params.season, params.farmableBeans)
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

  return {
    // Bean
    userBeanDeposits,
    beanWithdrawals,
    beanDepositsBalance,
    // LP
    userLPSeedDeposits,
    userLPDeposits,
    lpWithdrawals,
    lpDepositsBalance,
    // Curve
    userCurveDeposits,
    userCurveBDVDeposits,
    curveWithdrawals,
    curveDepositsBalance,
    // BEAN:LUSD
    userBeanlusdDeposits,
    userBeanlusdBDVDeposits,
    beanlusdWithdrawals,
    beanlusdDepositsBalance,
    // Plots
    userPlots,
  }
}