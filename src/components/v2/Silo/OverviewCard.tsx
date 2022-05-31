import { Box, Button, Card, Stack, Tab, Tabs, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import useSiloTokenBreakdown from 'hooks/useSiloTokenBreakdown';
import useUSD from 'hooks/useUSD';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState } from 'state';
import { displayBN, displayUSD } from 'util/index';

import SimpleLineChart, { DataPoint } from '../Charts/SimpleLineChart';
import { mockDepositData, mockOwnershipPctData } from '../Charts/SimpleLineChart.mock';
import MainnetOverlay from '../Common/MainnetOverlay';

// ------------------------------------------------

const WINDOWS = [
  { label: '1H', },
  { label: '1D', },
  { label: '1W', },
  { label: '1M', },
  { label: '1Y', },
  { label: 'All', },
];

type TabData = {
  season: BigNumber;
  current: BigNumber[];
  series: (DataPoint[])[]
}

// ------------------------------------------------

const DepositsTab : React.FC<TabData> = ({
  season,
  current,
  series
}) => {
  const getUSD = useUSD();
  const [displayValue, setDisplayValue] = useState(current);
  const handleCursor = useCallback((ds?: DataPoint[]) => {
    setDisplayValue(ds ? ds.map((d) => new BigNumber(d.value)) : current);
  }, [current]);
  useEffect(() => setDisplayValue(current), [current]);

  return (
    <>
      <Box sx={{ px: 2 }}>
        <Stack gap={0.5}>
          <Typography color="gray">Total Silo Deposits</Typography>
          <Typography variant="h1" color="primary">
            {displayUSD(getUSD(displayValue[0]))}
          </Typography>
          <Typography>Season {displayBN(season)}</Typography>
        </Stack>
      </Box>
      <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
        <MainnetOverlay>
          Deposit value over time will be available upon Unpause
        </MainnetOverlay>
        <SimpleLineChart
          series={series}
          onCursor={handleCursor}
        />
      </Box>
    </>
  );
};

const StalkOwnershipTab : React.FC<
  TabData
  & { beanstalkSilo: AppState['_beanstalk']['silo']; }
> = ({
  current,
  series,
  season,
  beanstalkSilo,
}) => {
  // Display value is an array [stalk, pct]
  const [displayValue, setDisplayValue] = useState(current);
  const handleCursor = useCallback((dps?: DataPoint[]) => {
    setDisplayValue(dps ? dps.map((dp) => new BigNumber(dp.value)) : current);
  }, [current]);
  useEffect(() => setDisplayValue(current), [current]);

  // Get ownership
  const ownership = displayValue[0].div(beanstalkSilo.stalk.active);

  return (
    <>
      <Stack direction="row" gap={4} sx={{ px: 2 }}>
        <Stack gap={0.5} sx={{ minWidth: 180 }}>
          <Typography color="gray">My Stalk</Typography>
          <Typography variant="h1" color="primary">
            {displayBN(displayValue[0])}
          </Typography>
          <Typography>Season {displayBN(season)}</Typography>
        </Stack>
        <Stack gap={0.5}>
          <Typography color="gray">Ownership % of all Stalk</Typography>
          <Typography variant="h1" color="secondary.dark">
            {(displayValue[1].multipliedBy(100)).toFixed(3)}%
          </Typography>
        </Stack>
      </Stack>
      <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
        <MainnetOverlay>
          Stalk value over time will be available upon Unpause
        </MainnetOverlay>
        <SimpleLineChart
          series={series}
          onCursor={handleCursor}
        />
      </Box>
    </>
  );
};

// ------------------------------------------------

const OverviewCard : React.FC<{
  farmerSilo: AppState['_farmer']['silo'];
  beanstalkSilo: AppState['_beanstalk']['silo'];
  breakdown: ReturnType<typeof useSiloTokenBreakdown>;
  season: BigNumber;
}> = ({
  farmerSilo,
  beanstalkSilo,
  breakdown,
  season
}) => {
  const [tab, setTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Card>
      {/* FIXME: sizing between deposits tab and Total Silo Deposits */}
      <Stack direction="row" justifyContent="space-between" sx={{ px: 2, pt: 2 }}>
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
          current={[breakdown.bdv]}
          series={[mockDepositData]}
          season={season}
        />
      </Box>
      <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
        <StalkOwnershipTab
          current={[
            farmerSilo.stalk.active,
            farmerSilo.stalk.active.div(beanstalkSilo.stalk.total)
          ]}
          series={[mockDepositData, mockOwnershipPctData]}
          beanstalkSilo={beanstalkSilo}
          season={season}
        />
      </Box>
    </Card>
  );
};

export default OverviewCard;
