import BigNumber from 'bignumber.js';
import { UNI_V2_ETH_BEAN_LP, UNI_V2_USDC_ETH_LP } from 'constants/index';
import { Withdrawals } from 'state/userBalance/reducer';
import {
  account,
  beanstalkContractReadOnly,
  benchmarkStart,
  benchmarkEnd,
  pairContractReadOnly,
  txCallback,
} from './index';

const IGNORED_EVENTS = new Set([
  'SeasonSnapshot',
  'WeatherChange',
  'Swap',
  'Transfer',
]);

let listeningForEvents = false;
// let lastPriceRefresh = new Date().getTime();
// let lastTotalsRefresh = new Date().getTime();
const newEventHashes = new Set();

//
export async function initializeEventListener(
  processEvents: Function,
  updatePrices: Function,
  updateTotals: Function
) {
  const startTime = benchmarkStart('EVENT LISTENER');

  const beanstalk = beanstalkContractReadOnly();
  const beanPair = pairContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const usdcPair = pairContractReadOnly(UNI_V2_USDC_ETH_LP);

  console.log('initializeEventListener: ', account);

  const accountEvents = await Promise.all([
    beanstalk.getPastEvents('BeanDeposit', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('BeanRemove', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('BeanWithdraw', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('LPDeposit', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('LPRemove', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('LPWithdraw', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('Deposit', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('RemoveSeason', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('RemoveSeasons', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('Withdraw', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('ClaimSeason', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('ClaimSeasons', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('Sow', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('Harvest', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('BeanClaim', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('LPClaim', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('Proposal', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('EtherClaim', {
      filter: { account: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('PlotTransfer', {
      filter: { from: account },
      fromBlock: 0,
    }),
    beanstalk.getPastEvents('PlotTransfer', {
      filter: { to: account },
      fromBlock: 0,
    }),
  ]).catch((err) => {
    console.error('initializeEventListener: failed to fetch accountEvents', err);
    throw err;
  }).then((result) => {
    console.log('initializeEventListener: fetched accountEvents', result);
    return result;
  });

  // eslint-disable-next-line
  let allEvents : any[] = [].concat.apply([], accountEvents);
  allEvents.sort((a, b) => {
    const diff = a.blockNumber - b.blockNumber;
    if (diff !== 0) return diff;
    return a.logIndex - b.logIndex;
  });

  benchmarkEnd('EVENT LISTENER (BEANSTALK)', startTime);

  if (listeningForEvents) {
    benchmarkEnd('EVENT LISTENER (already listening)', startTime);
    return allEvents;
  }
  listeningForEvents = true;

  /* Listen for new Contract events */
  // beanPair.events.allEvents({ fromBlock: 'latest' }, (error, event) => {
  //   if (
  //     new Date().getTime() - lastPriceRefresh > 5000 &&
  //     (event?.returnValues.to === undefined ||
  //       event?.returnValues.to.toLowerCase() !== account.toLowerCase())
  //   ) {
  //     console.log('UPDATING PRICES!');
  //     updatePrices();
  //     lastPriceRefresh = new Date().getTime();
  //   }
  // });
  // usdcPair.events.Swap({ fromBlock: 'latest' }, () => {
  //   if (new Date().getTime() - lastPriceRefresh > 5000) {
  //     console.log('UPDATING PRICES!');
  //     updatePrices();
  //     lastPriceRefresh = new Date().getTime();
  //   }
  // });
  // beanstalk.events.allEvents({ fromBlock: 'latest' }, (error, event) => {
  //   if (IGNORED_EVENTS.has(event.event)) {
  //     return;
  //   }
  //   const newEventHash = event.transactionHash + String(event.logIndex);
  //   if (newEventHashes.has(newEventHash)) {
  //     return;
  //   }
  //   newEventHashes.add(newEventHash);

  //   if (
  //     event?.returnValues.account !== undefined &&
  //     event?.returnValues.account.toLowerCase() === account.toLowerCase()
  //   ) {
  //     allEvents = [...allEvents, event];
  //     processEvents(allEvents);
  //   } else if (event.event === 'Sunrise') {
  //     processEvents(allEvents);
  //     if(txCallback) txCallback();
  //     console.log('-------UPDATING TOTALS!');
  //     updateTotals();
  //     lastTotalsRefresh = new Date().getTime();
  //     lastPriceRefresh = new Date().getTime();
  //   } else if (new Date().getTime() - lastTotalsRefresh > 5000) {
  //     console.log('UPDATING TOTALS!');
  //     updateTotals();
  //     lastTotalsRefresh = new Date().getTime();
  //   }
  // });

  benchmarkEnd('EVENT LISTENER', startTime);
  return allEvents;
}

//
export function parseWithdrawals(
  withdrawals: Withdrawals, 
  currentSeason: BigNumber
) : [
  transitBalance: BigNumber,
  receivableBalance: BigNumber,
  transitWithdrawals: Withdrawals,
  receivableBalance: Withdrawals,
] {
  let receivableBalance = new BigNumber(0);
  let transitBalance    = new BigNumber(0);
  const receivableWithdrawals : Withdrawals = {};
  const transitWithdrawals    : Withdrawals = {};

  // Split each withdrawal between `receivable` and `transit`.
  Object.keys(withdrawals).forEach((season: string) => {
    const v = withdrawals[season];
    if (new BigNumber(season).isLessThanOrEqualTo(currentSeason)) {
      receivableBalance = receivableBalance.plus(v);
      receivableWithdrawals[season] = v;
    } else {
      transitBalance = transitBalance.plus(v);
      transitWithdrawals[season] = v;
    }
  });

  return [
    transitBalance,
    receivableBalance,
    transitWithdrawals,
    receivableWithdrawals
  ];
}

// @publius to discuss: rename of crates
// "crate" = a Deposit or Withdrawal
export function addRewardedCrates(
  crates,
  season,
  rewardedBeans
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

export function parsePlots(plots, index: BigNumber) {
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
