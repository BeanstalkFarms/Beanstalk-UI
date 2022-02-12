import BigNumber from 'bignumber.js';
import { UNI_V2_ETH_BEAN_LP, UNI_V2_USDC_ETH_LP } from 'constants/index';
// import { EventData } from 'web3'
// import { Contract, Event } from 'ethers';
import {
  account,
  beanstalkContractReadOnly,
  pairContractReadOnly,
  txCallback,
} from './index';

const IGNORED_EVENTS = new Set([
  'SeasonSnapshot',
  'WeatherChange',
  'Swap',
  'Transfer',
]);

const benchmarkStart = (operation) => {
  console.log(`LOADING ${operation}`);
  return Date.now();
};
const benchmarkEnd = (operation, startTime) => {
  console.log(
    `LOADED ${operation} (${(Date.now() - startTime) / 1e3} seconds)`
  );
};

let listeningForEvents = false;
let lastPriceRefresh = new Date().getTime();
let lastTotalsRefresh = new Date().getTime();
const newEventHashes = new Set();

//
export async function initializeEventListener(
  callback: Function,
  updatePrices: Function,
  updateTotals: Function
) {
  const startTime = benchmarkStart('EVENT LISTENER');

  const beanstalk = beanstalkContractReadOnly();
  const beanPair = pairContractReadOnly(UNI_V2_ETH_BEAN_LP);
  const usdcPair = pairContractReadOnly(UNI_V2_USDC_ETH_LP);

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
  ]);

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
  beanPair.events.allEvents({ fromBlack: 'latest' }, (error, event) => {
    if (
      new Date().getTime() - lastPriceRefresh > 5000 &&
      (event.returnValues.to === undefined ||
        event.returnValues.to.toLowerCase() !== account.toLowerCase())
    ) {
      console.log('UPDATING PRICES!');
      updatePrices();
      lastPriceRefresh = new Date().getTime();
    }
  });
  usdcPair.events.Swap({ fromBlack: 'latest' }, () => {
    if (new Date().getTime() - lastPriceRefresh > 5000) {
      console.log('UPDATING PRICES!');
      updatePrices();
      lastPriceRefresh = new Date().getTime();
    }
  });
  beanstalk.events.allEvents({ fromBlock: 'latest' }, (error, event) => {
    if (IGNORED_EVENTS.has(event.event)) {
      return;
    }
    const newEventHash = event.transactionHash + String(event.logIndex);
    if (newEventHashes.has(newEventHash)) {
      return;
    }
    newEventHashes.add(newEventHash);

    if (
      event.returnValues.account !== undefined &&
      event.returnValues.account.toLowerCase() === account.toLowerCase()
    ) {
      allEvents = [...allEvents, event];
      callback(allEvents);
    } else if (event.event === 'Sunrise') {
      callback(allEvents);
      txCallback();
      console.log('-------UPDATING TOTALS!');
      updateTotals();
      lastTotalsRefresh = new Date().getTime();
      lastPriceRefresh = new Date().getTime();
    } else if (new Date().getTime() - lastTotalsRefresh > 5000) {
      console.log('UPDATING TOTALS!');
      updateTotals();
      lastTotalsRefresh = new Date().getTime();
    }
  });

  benchmarkEnd('EVENT LISTENER', startTime);
  return allEvents;
}

export function parseWithdrawals(withdrawals, index: BigNumber) {
  let receivable = new BigNumber(0);
  let transit = new BigNumber(0);
  const transitWithdrawals = {};
  const receivableWithdrawals = {};
  Object.keys(withdrawals).forEach((s) => {
    if (new BigNumber(s).isLessThanOrEqualTo(index)) {
      receivable = receivable.plus(withdrawals[s]);
      receivableWithdrawals[s] = withdrawals[s];
    } else {
      transit = transit.plus(withdrawals[s]);
      transitWithdrawals[s] = withdrawals[s];
    }
  });
  return [transit, receivable, transitWithdrawals, receivableWithdrawals];
}

// @publius to discuss: rename of crates
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
