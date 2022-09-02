import { Box, Card, Tabs } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';
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
import { displayBN } from '~/util';
import { ChipLabel, StyledTab } from '~/components/Common/Tabs';
import { ZERO_BN } from '~/constants';
import Row from '~/components/Common/Row';

const SLUGS = ['deposits', 'stalk'];
const Overview: React.FC<{
  farmerSilo:     AppState['_farmer']['silo'];
  beanstalkSilo:  AppState['_beanstalk']['silo'];
  breakdown:      ReturnType<typeof useFarmerBalancesBreakdown>;
  season:         BigNumber;
}> = ({ farmerSilo, beanstalkSilo, breakdown, season }) => {
  const [tab, handleChange] = useTabs(SLUGS, 'view');
  console.log('STALK OWN', farmerSilo.stalk.active.div(beanstalkSilo.stalk.total).toNumber());
  console.log('ACTIVE', farmerSilo.stalk.active.toNumber());
  return (
    <Card>
      {/* FIXME: sizing between deposits tab and Total Silo Deposits */}
      <Row
        justifyContent="space-between"
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
        }}
      >
        {/* Tabs */}
        <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0 }}>
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
        </Tabs>
        {/* "Windows" (time range selector) */}
        <Box sx={{ display: 'none' }}>
          {/* <TimeTabs tab={timeTab} setState={handleChangeTimeTab} /> */}
        </Box>
      </Row>
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
            mockDepositData,
            mockOwnershipPctData,
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
    </Card>
  );
};

export default Overview;
