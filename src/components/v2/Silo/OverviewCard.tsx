import { Box, Button, Card, Stack, Tab, Tabs, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import useSiloTokenBreakdown from 'hooks/useSiloTokenBreakdown';
import useUSD from 'hooks/useUSD';
import React, { useCallback, useState } from 'react';
import { AppState } from 'state';
import { displayBN, displayUSD } from 'util/index';

import SimpleLineChart, { DataPoint } from '../Charts/SimpleLineChart';
import { mockDepositData, mockOwnershipPctData } from '../Charts/SimpleLineChart.mock';

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
      <Box sx={{ width: '100%', height: '200px' }}>
        <SimpleLineChart
          series={series}
          onCursor={handleCursor}
        />
      </Box>
    </>
  );
};

const StalkOwnershipTab : React.FC<TabData> = ({
  current,
  series,
  season
}) => {
  const [displayValue, setDisplayValue] = useState(current);
  const handleCursor = useCallback((ds?: DataPoint[]) => {
    setDisplayValue(ds ? ds.map((d) => new BigNumber(d.value)) : current);
  }, [current]);
  
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
      <Box sx={{ width: '100%', height: '200px' }}>
        <SimpleLineChart
          series={series}
          onCursor={handleCursor}
        />
      </Box>
    </>
  );
};

const OverviewCard : React.FC<{
  farmerSilo: AppState['_farmer']['silo'];
  breakdown: ReturnType<typeof useSiloTokenBreakdown>;
  season: BigNumber;
}> = ({
  farmerSilo,
  breakdown,
  season
}) => {
  const [tab, setTab] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Card>
      {/* FIXME: sizing between deposits tab and Total Silo Deposits */}
      <Stack direction="row" justifyContent="space-between" sx={{ px: 2, pt: 2 }}>
        <Tabs value={tab} onChange={handleChange}>
          <Tab label="Deposits" />
          <Tab label="Stalk Ownership" />
        </Tabs>
        <Box>
          <Stack direction="row">
            {WINDOWS.map((w) => (
              <Button
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
          current={[farmerSilo.stalk.active, new BigNumber(0.01)]}
          series={[mockDepositData, mockOwnershipPctData]}
          season={season}
        />
      </Box>
    </Card>
  );
};

export default OverviewCard;
