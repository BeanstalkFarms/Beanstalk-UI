import { Box, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useCallback, useMemo } from 'react';
import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import { AppState } from '~/state';

import useTabs from '~/hooks/display/useTabs';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN, SEEDS, STALK } from '~/constants/tokens';
import { displayPercentage, displayStalk, displayUSD, toTokenUnitsBN } from '~/util';
import { ChipLabel, StyledTab } from '~/components/Common/Tabs';
import { ZERO_BN } from '~/constants';
import Row from '~/components/Common/Row';
import { FarmerSiloRewardsQuery, SeasonalPriceDocument, SeasonalPriceQuery, useFarmerSiloAssetSnapshotsQuery, useFarmerSiloRewardsQuery } from '~/generated/graphql';
import useAccount from '~/hooks/ledger/useAccount';
import { Module, ModuleTabs } from '~/components/Common/Module';
import useSeason from '~/hooks/beanstalk/useSeason';
import { SeasonDataPoint } from '~/components/Common/Charts/SeasonPlot';
import useSeasonsQuery, { SeasonRange } from '~/hooks/beanstalk/useSeasonsQuery';
import OverviewPlot from '~/components/Silo/OverviewPlot';
import Stat from '~/components/Common/Stat';

const secondsToDate = (ts: string) => new Date(parseInt(ts, 10) * 1000);

const addBufferSeasons = (
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

const interpolateFarmerStalk = (
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

type Snapshot = { season: number, timestamp: string, hourlyDepositedBDV: string };

const interpolateFarmerDepositedValue = (
  snapshots: Snapshot[], // oldest season first
  _prices: SeasonalPriceQuery['seasons'], // most recent season first
  bufferSeasons : number = 24
) => {
  const prices = Array.from(_prices).reverse();
  if (prices.length === 0) return [];

  // Sequence
  let j = 0;
  const minSeason = snapshots[j].season;
  const maxSeason = prices[prices.length - 1].season;

  let currBDV : BigNumber = ZERO_BN;
  let nextSeason : number | undefined = minSeason;

  //
  let priceStartIndex = prices.findIndex((p) => minSeason <= p.season) + 1;
  if (priceStartIndex < 0) priceStartIndex = 0;
  
  // if the subgraph misses some prices or something happens in the frontend
  // we use the last known price until we encounter a price at the current season
  let currPriceIndex = priceStartIndex;

  const points : SeasonDataPoint[] = [];

  //

  for (let s = minSeason; s <= maxSeason; s += 1) {
    const thisPrice = prices[currPriceIndex];
    const nextPrice = prices[currPriceIndex + 1];
    const thisTimestamp = DateTime.fromJSDate(secondsToDate(thisPrice.timestamp));
    let thisBDV = currBDV;
    
    //
    if (nextPrice && s >= nextPrice?.season) {
      currPriceIndex += 1;
    }

    //
    if (s === nextSeason) {
      // Reached a data point for which we have a snapshot.
      // Use the corresponding total deposited BDV.
      // Since we combined multiple tokens together, we may have a deposit for multiple
      // tokens in the same season. Keep adding to 
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

  console.log('Points', points);

  return addBufferSeasons(points, bufferSeasons);
};

const useFarmerStalkInterpolation = (
  siloRewardsQuery: ReturnType<typeof useFarmerSiloRewardsQuery>
) => {
  const season = useSeason();
  return useMemo(() => {
    if (!season.gt(0) || !siloRewardsQuery.data?.snapshots?.length) return [[], []];
    const snapshots = siloRewardsQuery.data.snapshots;
    return interpolateFarmerStalk(snapshots, season);
  }, [siloRewardsQuery.data?.snapshots, season]);
};

const useFarmerDepositedValueInterpolation = (
  siloAssetsQuery: ReturnType<typeof useFarmerSiloAssetSnapshotsQuery>,
  priceQuery: ReturnType<typeof useSeasonsQuery>,
) => {
  const unripe = useSelector<AppState, AppState['_bean']['unripe']>((state) => state._bean.unripe);
  return useMemo(() => {
    if (
      priceQuery.loading
      || !priceQuery.data?.seasons?.length
      || !siloAssetsQuery.data?.farmer?.silo?.assets.length
      || Object.keys(unripe).length === 0
    ) {
      return [];
    }

    // Convert the list of assets => snapshots into one snapshot list
    // sorted by season and normalized based on chop rate.
    const snapshots = siloAssetsQuery.data.farmer.silo.assets.reduce((prev, curr) => {
      const tokenAddress = curr.token.toLowerCase();
      prev.push(
        ...curr.hourlySnapshots.map((snapshot) => ({
          ...snapshot,
          hourlyDepositedBDV: (
            // NOTE: this isn't really true since it uses the *instantaneous* chop rate,
            // and the BDV of an unripe token isn't necessarily equal to this. but this matches
            // up with what the silo table below the overview shows.
            unripe[tokenAddress]
              ? new BigNumber(snapshot.hourlyDepositedAmount).times(unripe[tokenAddress].chopRate)
              : snapshot.hourlyDepositedBDV
          )
        }))
      );
      return prev;
    }, [] as Snapshot[]).sort((a, b) => a.season - b.season);

    console.debug('Snapshots', snapshots);

    return interpolateFarmerDepositedValue(snapshots, priceQuery.data.seasons);
  }, [
    unripe,
    priceQuery.loading, 
    priceQuery.data, 
    siloAssetsQuery.data,
  ]);
};

const depositStats = (s: BigNumber, v: BigNumber[]) => (
  <Stat
    title="Value Deposited"
    titleTooltip={(
      <>
        Shows the historical value of your Silo Deposits. <br />
        <Typography variant="bodySmall">
          Note: Unripe assets are valued based on the current Chop Rate. Earned Beans are shown upon Plant.
        </Typography>
      </>
    )}
    subtitle={`Season ${s.toString()}`}
    amount={displayUSD(v[0])}
    color="primary"
    amountIcon={undefined}
    gap={0.25}
    sx={{ ml: 0 }}
  />
);

const seedsStats = (s: BigNumber, v: BigNumber[]) => (
  <Stat
    title="Seed Balance"
    titleTooltip="Seeds are illiquid tokens that yield 1/10,000 Stalk each Season."
    subtitle={`Season ${s.toString()}`}
    amount={displayStalk(v[0])}
    color="primary"
    sx={{ minWidth: 180, ml: 0 }}
    amountIcon={undefined}
    gap={0.25}
  />
);

const useFarmerOverviewData = (account: string | undefined) => {
  const siloRewardsQuery = useFarmerSiloRewardsQuery({ variables: { account: account || '' }, skip: !account, fetchPolicy: 'cache-and-network' });
  const siloAssetsQuery = useFarmerSiloAssetSnapshotsQuery({ variables: { account: account || '' }, skip: !account, fetchPolicy: 'cache-and-network' });
  const priceQuery = useSeasonsQuery(SeasonalPriceDocument, SeasonRange.ALL);

  //
  const [stalkData, seedsData] = useFarmerStalkInterpolation(siloRewardsQuery);
  const depositData = useFarmerDepositedValueInterpolation(siloAssetsQuery, priceQuery);

  return {
    data: {
      deposits: depositData,
      stalk: stalkData,
      seeds: seedsData,
    },
    loading: (
      siloRewardsQuery.loading
      || siloAssetsQuery.loading 
      || priceQuery.loading
      // || breakdown hasn't loaded value yet
    )
  };
};

const SLUGS = ['deposits', 'stalk'];
const Overview: React.FC<{
  farmerSilo:     AppState['_farmer']['silo'];
  beanstalkSilo:  AppState['_beanstalk']['silo'];
  breakdown:      ReturnType<typeof useFarmerBalancesBreakdown>;
  season:         BigNumber;
}> = ({
  farmerSilo,
  beanstalkSilo,
  breakdown,
  season
}) => {
  const [tab, handleChange] = useTabs(SLUGS, 'view');

  //
  const account = useAccount();
  const { data, loading } = useFarmerOverviewData(account);

  //
  const ownership = (
    (farmerSilo.stalk.active?.gt(0) && beanstalkSilo.stalk.total?.gt(0))
      ? farmerSilo.stalk.active.div(beanstalkSilo.stalk.total)
      : ZERO_BN
  );
  const stalkStats = useCallback((s: BigNumber, v: BigNumber[]) => (
    <>
      <Stat
        title="Stalk Balance"
        titleTooltip="Stalk is the governance token of the Beanstalk DAO. Stalk entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Your Stalk is forfeited when you Withdraw your Deposited assets from the Silo."
        subtitle={`Season ${s.toString()}`}
        amount={displayStalk(v[0])}
        color="primary"
        sx={{ minWidth: 220, ml: 0 }}
        gap={0.25}
      />
      <Stat
        title="Stalk Ownership"
        titleTooltip="Your current ownership of Beanstalk is displayed as a percentage. Ownership is determined by your proportional ownership of the total Stalk supply"
        amount={displayPercentage(ownership.multipliedBy(100))}
        color="secondary.dark"
        gap={0.25}
        sx={{ minWidth: 200, ml: 0 }}
      />
      <Stat
        title="Stalk Grown per Day"
        titleTooltip="Your current ownership of Beanstalk is displayed as a percentage. Ownership is determined by your proportional ownership of the total Stalk supply"
        amount={displayStalk(farmerSilo.seeds.active.times(1 / 10_000).times(24))}
        color="text.secondary"
        gap={0.25}
        sx={{ minWidth: 120, ml: 0 }}
      />
    </>
  ), [farmerSilo, ownership]);

  return (
    <Module>
      <ModuleTabs value={tab} onChange={handleChange} sx={{ minHeight: 0 }}>
        <StyledTab label={
          <ChipLabel name="Deposits">
            {displayUSD(breakdown.states.deposited.value)}
            {/* <Fiat value={breakdown.states.deposited.value} amount={breakdown.states.deposited.value} /> */}
          </ChipLabel>
        } />
        <StyledTab label={
          <ChipLabel name="Stalk">
            <Row alignItems="center"><TokenIcon token={STALK} /> {displayStalk(farmerSilo.stalk.active, 0)}</Row>
          </ChipLabel>
        } />
        <StyledTab label={
          <ChipLabel name="Seeds">
            <Row alignItems="center"><TokenIcon token={SEEDS} /> {displayStalk(farmerSilo.seeds.active, 0)}</Row>
          </ChipLabel>
        } />
      </ModuleTabs>
      <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
        <OverviewPlot
          label="Silo Deposits"
          account={account}
          current={useMemo(() => ([
            breakdown.states.deposited.value
          ]), [breakdown.states.deposited.value])}
          series={useMemo(() => ([
            data.deposits
          ]), [data.deposits])}
          season={season}
          stats={depositStats}
          loading={loading}
          empty={breakdown.states.deposited.value.eq(0)}
        />
      </Box>
      <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
        <OverviewPlot
          label="Stalk Ownership"
          account={account}
          current={useMemo(() => ([
            farmerSilo.stalk.active,
            // Show zero while these data points are loading
            ownership,
          ]), [farmerSilo.stalk.active, ownership])}
          series={useMemo(() => ([
            data.stalk
            // mockOwnershipPctData
          ]), [data.stalk])}
          season={season}
          stats={stalkStats}
          loading={loading}
          empty={farmerSilo.stalk.total.lte(0)}
        />
      </Box>
      <Box sx={{ display: tab === 2 ? 'block' : 'none' }}>
        <OverviewPlot
          label="Seeds Ownership"
          account={account}
          current={useMemo(() => ([
            farmerSilo.seeds.active,
          ]), [farmerSilo.seeds.active])}
          series={useMemo(() => ([
            data.seeds
          ]), [data.seeds])}
          season={season}
          stats={seedsStats}
          loading={loading}
          empty={farmerSilo.seeds.total.lte(0)}
        />
      </Box>
    </Module>
  );
};

export default Overview;
