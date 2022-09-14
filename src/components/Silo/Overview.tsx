import { Box } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
import { DateTime } from 'luxon';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import { AppState } from '~/state';

import useTabs from '~/hooks/display/useTabs';
import { mockDepositData } from '~/components/Common/Charts/LineChart.mock';
import SeedsView from '~/components/Silo/Views/SeedsView';
import StalkView from '~/components/Silo/Views/StalkView';
import DepositsView from '~/components/Silo/Views/DepositsView';
import TokenIcon from '~/components/Common/TokenIcon';
import { SEEDS, STALK } from '~/constants/tokens';
import Fiat from '~/components/Common/Fiat';
import { displayBN, toTokenUnitsBN } from '~/util';
import { ChipLabel, StyledTab } from '~/components/Common/Tabs';
import { ZERO_BN } from '~/constants';
import Row from '~/components/Common/Row';
import { FarmerSiloRewardsQuery, useFarmerSiloRewardsQuery } from '~/generated/graphql';
import useAccount from '~/hooks/ledger/useAccount';
import { Module, ModuleTabs } from '~/components/Common/Module';
import useSeason from '~/hooks/beanstalk/useSeason';
import { SeasonDataPoint } from '~/components/Common/Charts/SeasonPlot';

const secondsToDate = (ts: string) => new Date(parseInt(ts, 10) * 1000);

const addBufferSeasons = (
  points: SeasonDataPoint[],
  num: number = 24
) => {
  if (points.length === 0) return [];
  const currTimestamp = DateTime.fromJSDate(points[0].date);
  return [
    ...new Array(num).fill(null).map((_, i) => ({
      season: points[0].season + (i - num),
      date: currTimestamp.plus({ hours: i - num }).toJSDate(),
      value: 0,
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

const useFarmerStalkInterpolation = (query: ReturnType<typeof useFarmerSiloRewardsQuery>) => {
  const season = useSeason();
  return useMemo(() => {
    if (!season.gt(0) || !query.data?.snapshots?.length) return [[], []];
    const snapshots = query.data.snapshots;
    return interpolateFarmerStalk(snapshots, season);
  }, [query.data?.snapshots, season]);
};

const SLUGS = ['deposits', 'stalk'];
const Overview: React.FC<{
  farmerSilo:     AppState['_farmer']['silo'];
  beanstalkSilo:  AppState['_beanstalk']['silo'];
  breakdown:      ReturnType<typeof useFarmerBalancesBreakdown>;
  season:         BigNumber;
}> = ({ farmerSilo, beanstalkSilo, breakdown, season }) => {
  const [tab, handleChange] = useTabs(SLUGS, 'view');

  const account = useAccount();
  const farmerSiloQuery = useFarmerSiloRewardsQuery({ variables: { account }, skip: !account });
  const [stalkData, seedsData] = useFarmerStalkInterpolation(farmerSiloQuery);

  return (
    <Module>
      <ModuleTabs value={tab} onChange={handleChange} sx={{ minHeight: 0 }}>
        <StyledTab label={
          <ChipLabel name="Deposits">
            <Fiat value={breakdown.states.deposited.value} amount={breakdown.states.deposited.value} truncate />
          </ChipLabel>
        } />
        <StyledTab label={
          <ChipLabel name="Stalk">
            <Row alignItems="center"><TokenIcon token={STALK} /> {displayBN(farmerSilo.stalk.active)}</Row>
          </ChipLabel>
        } />
        <StyledTab label={
          <ChipLabel name="Seeds">
            <Row alignItems="center"><TokenIcon token={SEEDS} /> {displayBN(farmerSilo.seeds.active)}</Row>
          </ChipLabel>
        } />
      </ModuleTabs>
      <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
        <DepositsView
          current={[
            breakdown.states.deposited.value
          ]}
          series={[
            mockDepositData
          ]}
          season={season}
        />
      </Box>
      <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
        <StalkView
          current={[
            farmerSilo.stalk.active,
            // Show zero while these data points are loading
            (farmerSilo.stalk.active?.gt(0) && beanstalkSilo.stalk.total?.gt(0))
              ? farmerSilo.stalk.active.div(beanstalkSilo.stalk.total)
              : ZERO_BN,
          ]}
          series={[
            stalkData,
            // mockOwnershipPctData
          ]}
          season={season}
        />
      </Box>
      <Box sx={{ display: tab === 2 ? 'block' : 'none' }}>
        <SeedsView
          current={[
            farmerSilo.seeds.active,
          ]}
          series={[
            seedsData
          ]}
          season={season}
        />
      </Box>
    </Module>
  );
};

export default Overview;
