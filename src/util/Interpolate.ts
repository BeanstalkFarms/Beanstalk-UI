import BigNumber from 'bignumber.js';
import { DateTime } from 'luxon';
import { SeasonDataPoint } from '~/components/Common/Charts/SeasonPlot';
import { ZERO_BN } from '~/constants';
import { BEAN, BEAN_CRV3_LP, SEEDS, SILO_WHITELIST, STALK, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from '~/constants/tokens';
import { FarmerSiloRewardsQuery, SeasonalPriceQuery } from '~/generated/graphql';
import { secondsToDate, toTokenUnitsBN } from '~/util';
import { DataPoint2 } from '~/components/Common/Charts/StackedAreaChart';

export type Snapshot = { id: string; season: number, timestamp: string, hourlyDepositedBDV: string };

export const addBufferSeasons = (
  points: SeasonDataPoint[],
  num: number = 24
) => {
  if (points.length === 0) return [];
  const d = DateTime.fromJSDate(points[0].date);
  const n = (
    points[0].season < num
      ? Math.max(points[0].season - 1, 0) // season 1 = fill with 0 points
      : num
  );
  return [
    ...new Array(n).fill(null).map((_, i) => ({
      season: points[0].season + (i - n),
      date:   d.plus({ hours: i - n }).toJSDate(),
      value:  0,
    })),
    ...points,
  ];
};

export const addBufferSeasons2 = (
  points: DataPoint2[],
  num: number = 24
) => {
  if (points.length === 0) return [];
  const d = DateTime.fromJSDate(points[0].date);
  const n = (
    points[0].season < num
      ? Math.max(points[0].season - 1, 0) // season 1 = fill with 0 points
      : num
  );
  return [
    ...new Array(n).fill(null).map((_, i) => ({
      season: points[0].season + (i - n),
      date:   d.plus({ hours: i - n }).toJSDate(),
      bean:  0,
      urBean: 0,
      bean3crv: 0,
      urBean3crv: 0
    })),
    ...points,
  ];
};

export const interpolateFarmerStalk = (
  snapshots: FarmerSiloRewardsQuery['snapshots'],
  season: BigNumber,
  bufferSeasons : number = 24
) => {
  // Sequence
  let j = 0;
  const minSeason = snapshots[j].season;
  const maxSeason = season.toNumber(); // current season
  let currStalk : BigNumber = ZERO_BN;
  let currSeeds : BigNumber = ZERO_BN;
  let currTimestamp = DateTime.fromJSDate(secondsToDate(snapshots[j].timestamp));
  let nextSeason : number | undefined = minSeason;
  
  // Add buffer points before the first snapshot
  const stalk : SeasonDataPoint[] = [];
  const seeds : SeasonDataPoint[] = [];
  
  for (let s = minSeason; s <= maxSeason; s += 1) {
    if (s === nextSeason) {
      // Reached a data point for which we have a snapshot.
      // Use the corresponding total stalk value.
      currStalk = toTokenUnitsBN(snapshots[j].totalStalk, STALK.decimals);
      currSeeds = toTokenUnitsBN(snapshots[j].totalSeeds, SEEDS.decimals);
      currTimestamp = DateTime.fromJSDate(secondsToDate(snapshots[j].timestamp));
      j += 1;
      nextSeason = snapshots[j]?.season || undefined;
    } else {
      // Estimate actual amount of stalk using seeds
      currStalk = currStalk.plus(currSeeds.multipliedBy(1 / 10_000)); // Each Seed grows 1/10,000 Stalk per Season
      currTimestamp = currTimestamp.plus({ hours: 1 });
    }
    stalk.push({
      season: s,
      date:   currTimestamp.toJSDate(),
      value:  currStalk.toNumber(),
    });
    seeds.push({
      season: s,
      date:   currTimestamp.toJSDate(),
      value:  currSeeds.toNumber(),
    });
  }
  
  return [
    addBufferSeasons(stalk, bufferSeasons),
    addBufferSeasons(seeds, bufferSeasons)
  ] as const;
};

export const interpolateFarmerDepositedValue = (
  snapshots: Snapshot[], // oldest season first
  _prices: SeasonalPriceQuery['seasons'], // most recent season first
  bufferSeasons : number = 24
) => {
  const prices = Array.from(_prices).reverse(); // FIXME: inefficient
  if (prices.length === 0) return [];

  // Sequence
  let j = 0;
  const minSeason = snapshots[j].season;
  const maxSeason = prices[prices.length - 1].season;
  let currBDV : BigNumber = ZERO_BN;
  let nextSeason : number | undefined = minSeason;

  // Price data goes all the way back to season 0, find the price index
  // where we should start iterating based on the user's oldest deposit
  let currPriceIndex = prices.findIndex((p) => p && minSeason <= p.season) + 1;
  if (currPriceIndex < 0) currPriceIndex = 0;

  // FIXME: p returning null sometimes during state transitions
  if (!prices[currPriceIndex]) return [];
  
  // if the subgraph misses some prices or something happens in the frontend
  // we use the last known price until we encounter a price at the current season
  const points : SeasonDataPoint[] = [];

  for (let s = minSeason; s <= maxSeason; s += 1) {
    const thisPrice = prices[currPriceIndex];
    const nextPrice = prices[currPriceIndex + 1];
    const thisTimestamp = DateTime.fromJSDate(secondsToDate(thisPrice.timestamp));
    let thisBDV = currBDV;
    
    // If there's another price and the season associated with the price is
    // either [the price for this season OR in the past], we'll save this price
    // and use it next time in case some data points are missed
    if (nextPrice && nextPrice?.season <= s) {
      currPriceIndex += 1;
    }

    if (s === nextSeason) {
      // Reached a data point for which we have a snapshot.
      // Use the corresponding total deposited BDV.
      // Since we combined multiple tokens together, we may have a deposit for multiple
      // tokens in the same season. Loop through all deposits of any token in season `s`
      // and sum up their BDV as `thisBDV`. Note that this assumes snapshots are sorted by season ascending.
      for (j; snapshots[j]?.season === nextSeason; j += 1) {
        thisBDV = thisBDV.plus(toTokenUnitsBN(snapshots[j].hourlyDepositedBDV, BEAN[1].decimals));
      }
      nextSeason = snapshots[j]?.season || undefined; // next season for which BDV changes
    }

    points.push({
      season: s,
      date:   thisTimestamp.toJSDate(),
      value:  thisBDV.multipliedBy(new BigNumber(thisPrice.price)).toNumber(),
    });

    currBDV = thisBDV;
  }

  return addBufferSeasons(points, bufferSeasons);
};

export const interpolateFarmerAssetBalances = (
  snapshots: Snapshot[], // oldest season first
  _prices: SeasonalPriceQuery['seasons'], // most recent season first
  bufferSeasons : number = 24
) => {
  const prices = Array.from(_prices).reverse(); // FIXME: inefficient
  if (prices.length === 0) return [];

  // Sequence
  let j = 0;
  const minSeason = snapshots[j].season;
  const maxSeason = prices[prices.length - 1].season;
  const currBDV : BigNumber = ZERO_BN;
  let nextSeason : number | undefined = minSeason;

  // Initialize zero balances for each silo asset
  const siloTokenBalances = SILO_WHITELIST.reduce<{ [address: string]: BigNumber }>((prev, curr) => {
    prev[curr[1].address] = ZERO_BN;
    return prev;
  }, {});

  // Price data goes all the way back to season 0, find the price index
  // where we should start iterating based on the user's oldest deposit
  let currPriceIndex = prices.findIndex((p) => p && minSeason <= p.season) + 1;
  if (currPriceIndex < 0) currPriceIndex = 0;

  // FIXME: p returning null sometimes during state transitions
  if (!prices[currPriceIndex]) return [];

  // if the subgraph misses some prices or something happens in the frontend
  // we use the last known price until we encounter a price at the current season
  const points : DataPoint2[] = [];

  for (let s = minSeason; s <= maxSeason; s += 1) {
    const thisPrice = prices[currPriceIndex];
    const nextPrice = prices[currPriceIndex + 1];
    const thisTimestamp = DateTime.fromJSDate(secondsToDate(thisPrice.timestamp));
    let thisBDV = currBDV;

    // If there's another price and the season associated with the price is
    // either [the price for this season OR in the past], we'll save this price
    // and use it next time in case some data points are missed
    if (nextPrice && nextPrice?.season <= s) {
      currPriceIndex += 1;
    }

    if (s === nextSeason) {
      // Reached a data point for which we have a snapshot.
      // Use the corresponding total deposited BDV.
      // Since we combined multiple tokens together, we may have a deposit for multiple
      // tokens in the same season. Loop through all deposits of any token in season `s`
      // and sum up their BDV as `thisBDV`. Note that this assumes snapshots are sorted by season ascending.
      for (j; snapshots[j]?.season === nextSeason; j += 1) {
        thisBDV = thisBDV.plus(toTokenUnitsBN(snapshots[j].hourlyDepositedBDV, BEAN[1].decimals));
        // @ts-ignore
        const tokenAddr = snapshots[j]?.id.match(/-(.*)-/).pop();
        if (tokenAddr) {
          siloTokenBalances[tokenAddr] = siloTokenBalances[tokenAddr]?.plus(
            toTokenUnitsBN(snapshots[j].hourlyDepositedBDV, BEAN[1].decimals)
              .multipliedBy(new BigNumber(thisPrice.price))
          );
        }
      }
      nextSeason = snapshots[j]?.season || undefined; // next season for which BDV changes
    }

    points.push({
      season: s,
      date:   thisTimestamp.toJSDate(),
      bean: siloTokenBalances[BEAN[1].address].toNumber(),
      urBean: siloTokenBalances[UNRIPE_BEAN[1].address].toNumber(),
      bean3crv: siloTokenBalances[BEAN_CRV3_LP[1].address].toNumber(),
      urBean3crv: siloTokenBalances[UNRIPE_BEAN_CRV3[1].address].toNumber(),
      totalValue: thisBDV.multipliedBy(new BigNumber(thisPrice.price)).toNumber()
    });

    // currBDV = thisBDV;
  }

  return addBufferSeasons2(points, bufferSeasons);
};
