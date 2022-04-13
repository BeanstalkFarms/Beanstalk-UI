import BigNumber from 'bignumber.js';
import { EventData } from 'web3-eth-contract';

import { UNI_V2_ETH_BEAN_LP, UNI_V2_USDC_ETH_LP } from 'constants/index';
import { Withdrawals } from 'state/userBalance/reducer';
import { DEPLOYMENT_BLOCKS } from 'constants/blocks';
import {
  account,
  benchmarkStart,
  benchmarkEnd,
  txCallback,
  beanstalkContractReadOnlyWs,
  pairContractReadOnlyWs,
  beanstalkContractReadOnly,
  chainId,
} from './index';

const IGNORED_EVENTS = new Set([
  'SeasonSnapshot',
  'WeatherChange',
  'Swap',
  'Transfer',
]);

let listeningForEvents = false;
let lastPriceRefresh = new Date().getTime();
let lastTotalsRefresh = new Date().getTime();
const newEventHashes = new Set();

/**
 * @rpc 20 separate calls to `getPastEvents`. Not batched.
 * @rpc 3 websocket opens for Beanstalk contract, BEAN:ETH + ETH:USDC pools.
 */
export async function initializeEventListener(
  processEvents: Function,
  updatePrices: Function,
  updateTotals: Function
) : Promise<EventData[]> {
  const startTime = benchmarkStart('EVENT LISTENER');
  const beanstalk = beanstalkContractReadOnly(true);

  const {
    BEANSTALK_GENESIS_BLOCK,
    BIP10_COMMITTED_BLOCK
  } = DEPLOYMENT_BLOCKS[chainId];

  const accountEvents = await Promise.all([
    beanstalk.getPastEvents('BeanDeposit', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('BeanRemove', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('BeanWithdraw', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('LPDeposit', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('LPRemove', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('LPWithdraw', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('Deposit', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('RemoveSeason', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('RemoveSeasons', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('Withdraw', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('ClaimSeason', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('ClaimSeasons', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('Sow', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('Harvest', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('BeanClaim', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('LPClaim', {
      filter: { account: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('PlotTransfer', {
      filter: { from: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    beanstalk.getPastEvents('PlotTransfer', {
      filter: { to: account },
      fromBlock: BEANSTALK_GENESIS_BLOCK,
    }),
    // Farmer's Market
    beanstalk.getPastEvents('PodListingCreated', {
      filter: { account },
      fromBlock: BIP10_COMMITTED_BLOCK,
    }),
    beanstalk.getPastEvents('PodListingCancelled', {
      filter: { account },
      fromBlock: BIP10_COMMITTED_BLOCK,
    }),
    beanstalk.getPastEvents('PodListingFilled', {
      filter: { from: account },
      fromBlock: BIP10_COMMITTED_BLOCK,
    }),
    beanstalk.getPastEvents('PodListingFilled', {
      filter: { to: account },
      fromBlock: BIP10_COMMITTED_BLOCK,
    }),
    beanstalk.getPastEvents('PodOrderCreated', {
      filter: { account },
      fromBlock: BIP10_COMMITTED_BLOCK,
    }),
    beanstalk.getPastEvents('PodOrderCancelled', {
      filter: { account },
      fromBlock: BIP10_COMMITTED_BLOCK,
    }),
    beanstalk.getPastEvents('PodOrderFilled', {
      filter: { from: account },
      fromBlock: BIP10_COMMITTED_BLOCK,
    }),
    beanstalk.getPastEvents('PodOrderFilled', {
      filter: { to: account },
      fromBlock: BIP10_COMMITTED_BLOCK,
    })
  ]).catch((err) => {
    console.error('initializeEventListener: failed to fetch accountEvents', err);
    throw err;
  });

  // eslint-disable-next-line
  let allEvents : EventData[] = [].concat.apply([], accountEvents);
  allEvents.sort((a, b) => {
    // First, sort by block number, highest blockNumber first.
    const diff = a.blockNumber - b.blockNumber;
    if (diff !== 0) return diff;
    // Then, sort by logIndex, highest logIndex first
    return a.logIndex - b.logIndex;
  });

  benchmarkEnd('EVENT LISTENER (BEANSTALK)', startTime);

  if (listeningForEvents) {
    benchmarkEnd('EVENT LISTENER (already listening)', startTime);
    return allEvents;
  }
  listeningForEvents = true;

  const beanstalkWs = beanstalkContractReadOnlyWs();
  const beanPairWs = pairContractReadOnlyWs(UNI_V2_ETH_BEAN_LP);
  const usdcPairWs = pairContractReadOnlyWs(UNI_V2_USDC_ETH_LP);

  /* Listen for new Contract events */
  beanPairWs.events.allEvents({ fromBlock: 'latest' }, (error: any, event: any) => {
    if (error) {
      console.error(error);
      return;
    }
    if (
      new Date().getTime() - lastPriceRefresh > 5000 &&
      (event?.returnValues.to === undefined ||
        event?.returnValues.to.toLowerCase() !== account.toLowerCase())
    ) {
      console.log('UPDATING PRICES!');
      updatePrices();
      lastPriceRefresh = new Date().getTime();
    }
  });
  usdcPairWs.events.Swap({ fromBlock: 'latest' }, (error: any) => {
    if (error) {
      console.error(error);
      return;
    }
    if (new Date().getTime() - lastPriceRefresh > 5000) {
      console.log('UPDATING PRICES!');
      updatePrices();
      lastPriceRefresh = new Date().getTime();
    }
  });
  beanstalkWs.events.allEvents({ fromBlock: 'latest' }, (error: any, event: any) => {
    console.log('[contract/beanstalk] Received event: ', event, error);
    if (error) {
      console.error(error);
      return;
    }
    if (IGNORED_EVENTS.has(event.event)) {
      return;
    }
    
    const newEventHash = event.transactionHash + String(event.logIndex);
    if (newEventHashes.has(newEventHash)) {
      return;
    }
    newEventHashes.add(newEventHash);

    if (
      event?.returnValues.account !== undefined &&
      event?.returnValues.account.toLowerCase() === account.toLowerCase()
    ) {
      // FIXME: looks like this is mutating state directly?
      allEvents = [...allEvents, event];
      processEvents(allEvents);
    } else if (event.event === 'Sunrise') {
      processEvents(allEvents);
      if (txCallback) txCallback();
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
