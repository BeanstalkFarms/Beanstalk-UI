import { Box } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
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
import { useFarmerSiloRewardsQuery } from '~/generated/graphql';
import useAccount from '~/hooks/ledger/useAccount';
import { Module, ModuleTabs } from '~/components/Common/Module';
import useSeason from '~/hooks/beanstalk/useSeason';
import { SeasonDataPoint } from '~/components/Common/Charts/SeasonPlot';

// //
// const farmerSiloQuery = useSeasonsQuery<FarmerSiloRewardsQuery>(FarmerSiloRewardsDocument, SeasonRange.WEEK, queryConfig);
// const queries = useMemo(() => [farmerSiloQuery], [farmerSiloQuery]);
// const series = useMemo(() => {
//   // const ready = !queries.some((q) => q.loading === true || !q.data?.seasons);
//   // if (ready) {
//   // }
//   // return queries.map((q) => (
//   // ))
// }, [queries]);

// const stalkData = useMemo(() => 
//   // if (farmerSiloQuery.data?.seasons?.length) {
//   //   return farmerSiloQuery.data.seasons.map((curr) => ({
//   //     season: curr.season,
//   //     date: new Date(parseInt(`${curr.timestamp}000`, 10)),
//   //     value: toTokenUnitsBN(curr.totalStalk, STALK.decimals).toNumber(),
//   //   })).sort(sortSeasons); 
//   // }
//    [],
//  [farmerSiloQuery.data?.seasons]);

const secondsToDate = (ts: string) => new Date(parseInt(ts, 10) * 1000);

const useFarmerStalkInterpolation = () => {
  const account = useAccount();
  const season = useSeason();
  const farmerSilo = useFarmerSiloRewardsQuery({ variables: { account }, skip: !account });

  return useMemo(() => {
    if (!season.gt(0)) return [];
    if (!farmerSilo.data?.snapshots) return [];
    const snapshots = farmerSilo.data.snapshots;

    if (snapshots.length === 0) return [];

    // Sequence
    let j = 0;
    console.log('Snapshots', snapshots);
    const minSeason = snapshots[j].season;
    const maxSeason = season.toNumber(); // current season
    
    let currStalk : BigNumber = ZERO_BN;
    let currSeeds : BigNumber = ZERO_BN;
    let currTimestamp : Date = new Date();
    let nextSeason : number | undefined = minSeason;
    const points : SeasonDataPoint[] = [];
    
    for (let s = minSeason; s <= maxSeason; s += 1) {
      if (s === nextSeason) {
        // Reached a data point for which we have a snapshot.
        // Use the corresponding total stalk value.
        currStalk = toTokenUnitsBN(snapshots[j].totalStalk, STALK.decimals);
        currSeeds = toTokenUnitsBN(snapshots[j].totalSeeds, SEEDS.decimals);
        currTimestamp = secondsToDate(snapshots[j].timestamp);
        j += 1;
        nextSeason = snapshots[j]?.season || undefined;
      } else {
        currStalk = currStalk.plus(currSeeds.multipliedBy(1 / 10_000)); // Each Seed grows 1/10,000 Stalk per Season
        currTimestamp.setTime(currTimestamp.getTime() + 1 * 60 * 60 * 1000);
      }
      points.push({
        season: s,
        date:   new Date(currTimestamp),
        value:  currStalk.toNumber(),
      });
    }
    
    return points;
  }, [farmerSilo.data?.snapshots, season]);
};

const SLUGS = ['deposits', 'stalk'];
const Overview: React.FC<{
  farmerSilo:     AppState['_farmer']['silo'];
  beanstalkSilo:  AppState['_beanstalk']['silo'];
  breakdown:      ReturnType<typeof useFarmerBalancesBreakdown>;
  season:         BigNumber;
}> = ({ farmerSilo, beanstalkSilo, breakdown, season }) => {
  const [tab, handleChange] = useTabs(SLUGS, 'view');

  //
  const data = useFarmerStalkInterpolation();
  console.debug('Stalk Interpolation', data);

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
            data,
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
            mockDepositData,
          ]}
          season={season}
        />
      </Box>
    </Module>
  );
};

export default Overview;
