import { Box, Card, Chip, Stack, styled, Tab, TabProps, Tabs } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';
import { Token } from 'graphql';
import useFarmerSiloBreakdown from '~/hooks/useFarmerSiloBreakdown';
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

const SLUGS = ['deposits', 'stalk', 'seeds'];

const Label : React.FC<{ name: string; token?: Token }> = ({ name, token, children }) => (
  <Stack direction="row" alignItems="center" gap={0.2}>
    {name}&nbsp;
    {/* <Typography variant="h4">{children}</Typography> */}
    <Chip label={children} size="small" />
  </Stack>
); 

const StyledTab = styled((props: TabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  root: {
    opacity: 1,
  },
  '&:hover': {
    cursor: 'pointer'
  },
  '& .MuiChip-label': {
    opacity: 0.7
  },
  '&.Mui-selected .MuiChip-root': {
    // backgroundColor: BeanstalkPalette.lightGrey
  },
  '&:hover .MuiChip-label, &.Mui-selected .MuiChip-label': {
    opacity: 1,
  },
  '& .MuiChip-root:hover': {
    cursor: 'pointer'
  }
}));

const Overview: React.FC<{
  farmerSilo:     AppState['_farmer']['silo'];
  beanstalkSilo:  AppState['_beanstalk']['silo'];
  breakdown:      ReturnType<typeof useFarmerSiloBreakdown>;
  season:         BigNumber;
}> = ({ farmerSilo, beanstalkSilo, breakdown, season }) => {
  const [tab, handleChange] = useTabs(SLUGS, 'view');
  return (
    <Card>
      {/* FIXME: sizing between deposits tab and Total Silo Deposits */}
      <Stack
        direction="row"
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
            <Label name="Deposits">
              <Fiat value={breakdown.states.deposited.value} amount={breakdown.states.deposited.value} truncate />
            </Label>
          } />
          <StyledTab label={
            <Label name="Stalk">
              <Stack direction="row" alignItems="center"><TokenIcon token={STALK} /> {displayBN(farmerSilo.stalk.active)}</Stack>
            </Label>
          } />
          <StyledTab label={
            <Label name="Seeds">
              <Stack direction="row" alignItems="center"><TokenIcon token={SEEDS} /> {displayBN(farmerSilo.seeds.active)}</Stack>
            </Label>
          } />
        </Tabs>
        {/* "Windows" (time range selector) */}
        <Box sx={{ display: 'none' }}>
          {/* <TimeTabs tab={timeTab} setState={handleChangeTimeTab} /> */}
        </Box>
      </Stack>
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
            farmerSilo.stalk.active.div(beanstalkSilo.stalk.total),
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
