import { Box } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import { AppState } from '~/state';

import useTabs from '~/hooks/display/useTabs';
import { mockDepositData, mockOwnershipPctData } from '~/components/Common/Charts/LineChart.mock';
import SeedsView from '~/components/Silo/Views/SeedsView';
import StalkView from '~/components/Silo/Views/StalkView';
import DepositsView from '~/components/Silo/Views/DepositsView';
import TokenIcon from '~/components/Common/TokenIcon';
import { SEEDS, STALK } from '~/constants/tokens';
import Fiat from '~/components/Common/Fiat';
import { displayBN, sortSeasons, toTokenUnitsBN } from '~/util';
import { ChipLabel, StyledTab } from '~/components/Common/Tabs';
import { ZERO_BN } from '~/constants';
import Row from '~/components/Common/Row';
import useSeasonsQuery, { SeasonRange } from '~/hooks/beanstalk/useSeasonsQuery';
import { FarmerSiloRewardsDocument, FarmerSiloRewardsQuery, SeasonalStalkDocument, SeasonalStalkQuery } from '~/generated/graphql';
import useAccount from '~/hooks/ledger/useAccount';
import { Module, ModuleTabs } from '~/components/Common/Module';

const SLUGS = ['deposits', 'stalk'];
const Overview: React.FC<{
  farmerSilo:     AppState['_farmer']['silo'];
  beanstalkSilo:  AppState['_beanstalk']['silo'];
  breakdown:      ReturnType<typeof useFarmerBalancesBreakdown>;
  season:         BigNumber;
}> = ({ farmerSilo, beanstalkSilo, breakdown, season }) => {
  const [tab, handleChange] = useTabs(SLUGS, 'view');
  //
  const account = useAccount();
  const queryConfig = useMemo(() => ({ variables: { account } }), [account]);
  const farmerSiloQuery = useSeasonsQuery<FarmerSiloRewardsQuery>(FarmerSiloRewardsDocument, SeasonRange.WEEK, queryConfig);
  const allStalkQuery   = useSeasonsQuery<SeasonalStalkQuery>(SeasonalStalkDocument, SeasonRange.WEEK);

  const stalkData = useMemo(() => {
    if (farmerSiloQuery.data?.seasons?.length) {
      return farmerSiloQuery.data.seasons.map((curr) => ({
        season: curr.season,
        date: new Date(parseInt(`${curr.timestamp}000`, 10)),
        value: toTokenUnitsBN(curr.totalStalk, STALK.decimals).toNumber(),
      })).sort(sortSeasons); 
    }
    return [];
  }, [farmerSiloQuery.data?.seasons]);

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
            mockOwnershipPctData
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
