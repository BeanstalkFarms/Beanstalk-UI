import { Box, Card, Stack, Tab, Tabs, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState } from 'state';
import { displayBN, displayUSD } from 'util/index';

import LineChart, { DataPoint } from 'components/Common/Charts/LineChart';
import {
  mockDepositData,
  mockOwnershipPctData,
} from 'components/Common/Charts/LineChart.mock';
import MainnetBlur from 'components/Common/ZeroState/MainnetBlur';
import Stat from 'components/Common/Stat';
import useTabs from 'hooks/display/useTabs';
import WalletButton from '../Common/Connection/WalletButton';
import useAccount from '../../hooks/ledger/useAccount';

// ------------------------------------------------

type TabData = {
  season: BigNumber;
  current: BigNumber[];
  series: DataPoint[][];
};

// ------------------------------------------------

const DepositsTab: React.FC<TabData> = ({ season, current, series }) => {
  const account = useAccount();
  const [displayValue, setDisplayValue] = useState(current);
  const handleCursor = useCallback(
    (ds?: DataPoint[]) => {
      setDisplayValue(ds ? ds.map((d) => new BigNumber(d.value)) : current);
    },
    [current]
  );
  useEffect(() => setDisplayValue(current), [current]);

  return (
    <>
      <Box sx={{ px: 2 }}>
        <Stat
          title="Total Silo Deposits"
          subtitle={`Season ${displayBN(season)}`}
          amount={displayUSD(displayValue[0])}
          color="primary"
          amountIcon={undefined}
          gap={0.25}
          sx={{ ml: 0 }}
        />
      </Box>
      <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
        {!account && (
          <MainnetBlur>
            <Stack justifyContent="center" alignItems="center" gap={1}>
              <Typography variant="body1" color="gray">Your Silo Deposits will appear here.</Typography>
              <WalletButton color="primary" sx={{ height: 45 }} />
            </Stack>
          </MainnetBlur>
        )}
        <LineChart series={series} onCursor={handleCursor} />
      </Box>
    </>
  );
};

const StalkOwnershipTab: React.FC<TabData
  // & { beanstalkSilo: AppState['_beanstalk']['silo']; }
> = ({ current, series, season }) => {
  // Display value is an array [stalk, pct]
  const account = useAccount();
  const [displayValue, setDisplayValue] = useState(current);
  const handleCursor = useCallback(
    (dps?: DataPoint[]) => {
      setDisplayValue(dps ? dps.map((dp) => new BigNumber(dp.value)) : current);
    },
    [current]
  );
  useEffect(() => setDisplayValue(current), [current]);

  return (
    <>
      <Stack direction="row" gap={4} sx={{ px: 2 }}>
        <Stat
          title="Stalk Balance"
          titleTooltip="This is your total Stalk Balance. Stalk are the governance token of the Beanstalk DAO. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Your Stalk is forfeited when you Withdraw your Deposited assets from the Silo."
          subtitle={`Season ${displayBN(season)}`}
          amount={displayBN(displayValue[0])}
          color="primary"
          sx={{ minWidth: 180, ml: 0 }}
          amountIcon={undefined}
          gap={0.25}
        />
        <Stat
          title="Ownership"
          titleTooltip="Your current ownership of Beanstalk is displayed as a percentage. Ownership is determined by your proportional ownership of the total Stalk supply."
          amount={`${displayValue[1].multipliedBy(100).toFixed(3)}%`}
          color="secondary.dark"
          amountIcon={undefined}
          gap={0.25}
          sx={{ ml: 0 }}
        />
      </Stack>
      <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
        {!account && (
          <MainnetBlur>
            <Stack justifyContent="center" alignItems="center" gap={1}>
              <Typography variant="body1" color="gray">Your Stalk Balance and Ownership will appear here.</Typography>
              <WalletButton color="primary" sx={{ height: 45 }} />
            </Stack>
          </MainnetBlur>
        )}
        <LineChart series={series} onCursor={handleCursor} />
      </Box>
    </>
  );
};

// ------------------------------------------------

const SLUGS = ['deposits', 'stalk'];

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
          <Tab label="Deposits" />
          <Tab label="Stalk Ownership" />
        </Tabs>
        {/* "Windows" (time range selector) */}
        <Box sx={{ display: 'none' }}>
          {/* <TimeTabs tab={timeTab} setState={handleChangeTimeTab} /> */}
        </Box>
      </Stack>
      <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
        <DepositsTab
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
        <StalkOwnershipTab
          current={[
            farmerSilo.stalk.active,
            farmerSilo.stalk.active.div(beanstalkSilo.stalk.total),
          ]}
          series={[mockDepositData, mockOwnershipPctData]}
          season={season}
        />
      </Box>
    </Card>
  );
};

export default Overview;
