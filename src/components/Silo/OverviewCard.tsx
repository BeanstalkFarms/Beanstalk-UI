import { Box, Button, Card, Stack, Tab, Tabs } from '@mui/material';
import BigNumber from 'bignumber.js';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBalances';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState } from 'state';
import { displayBN, displayUSD } from 'util/index';

import SimpleLineChart, { DataPoint } from 'components/Charts/SimpleLineChart';
import {
  mockDepositData,
  mockOwnershipPctData,
} from 'components/Charts/SimpleLineChart.mock';
import MainnetBlur from 'components/Common/MainnetBlur';
import Stat from 'components/Common/Stat';

// ------------------------------------------------

const WINDOWS = [
  { label: '1H' },
  { label: '1D' },
  { label: '1W' },
  { label: '1M' },
  { label: '1Y' },
  { label: 'All' },
];

type TabData = {
  season: BigNumber;
  current: BigNumber[];
  series: DataPoint[][];
};

// ------------------------------------------------

const DepositsTab: React.FC<TabData> = ({ season, current, series }) => {
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
          bottomText={`Season ${displayBN(season)}`}
          amount={displayUSD(displayValue[0])}
          color="primary"
          icon={undefined}
          gap={0.5}
          sx={{ ml: 0 }}
        />
      </Box>
      <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
        <MainnetBlur>
          Historical Deposit value will be available once Beanstalk is Replanted.
        </MainnetBlur>
        <SimpleLineChart series={series} onCursor={handleCursor} />
      </Box>
    </>
  );
};

const StalkOwnershipTab: React.FC<TabData
  // & { beanstalkSilo: AppState['_beanstalk']['silo']; }
  > = ({ current, series, season }) => {
  // Display value is an array [stalk, pct]
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
          title="My Stalk"
          bottomText={`Season ${displayBN(season)}`}
          amount={displayBN(displayValue[0])}
          color="primary"
          sx={{ minWidth: 180, ml: 0 }}
          icon={undefined}
          gap={0.5}
        />
        <Stat
          title="Ownership % of all Stalk"
          amount={`${displayValue[1].multipliedBy(100).toFixed(3)}%`}
          color="secondary.dark"
          icon={undefined}
          gap={0.5}
          sx={{ ml: 0 }}
        />
      </Stack>
      <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
        <MainnetBlur>
          Historical Stalk balance and ownership % will be available once Beanstalk is Replanted.
        </MainnetBlur>
        <SimpleLineChart series={series} onCursor={handleCursor} />
      </Box>
    </>
  );
};

// ------------------------------------------------

const OverviewCard: React.FC<{
  farmerSilo: AppState['_farmer']['silo'];
  beanstalkSilo: AppState['_beanstalk']['silo'];
  breakdown: ReturnType<typeof useFarmerSiloBreakdown>;
  season: BigNumber;
}> = ({ farmerSilo, beanstalkSilo, breakdown, season }) => {
  const [tab, setTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Card>
      {/* FIXME: sizing between deposits tab and Total Silo Deposits */}
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ px: 2, pt: 2 }}
      >
        {/* Tabs */}
        <Tabs value={tab} onChange={handleChangeTab}>
          <Tab label="Deposits" />
          <Tab label="Stalk Ownership" />
        </Tabs>
        {/* "Windows" (time range selector) */}
        <Box sx={{ display: 'none' }}>
          <Stack direction="row">
            {WINDOWS.map((w) => (
              <Button
                key={w.label}
                variant="text"
                size="small"
                color="dark"
                sx={{ px: 0.5, py: 0.5, minWidth: 0 }}
              >
                {w.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Stack>
      <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
        <DepositsTab
          current={[breakdown.totalValue]}
          series={[mockDepositData]}
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

export default OverviewCard;
