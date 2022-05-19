import { Box, Button, ButtonGroup, Card, Stack, Tab, Tabs, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import tempChartImage from 'img/temp-chart.svg';
import SimpleGraph, { DataPoint } from './SimpleGraph';

const windows = [
  { label: '1H', },
  { label: '1D', },
  { label: '1W', },
  { label: '1M', },
  { label: '1Y', },
  { label: 'All', },
]

const DepositsTab : React.FC<{
  totalDepositValue: number;
}> = ({ 
  totalDepositValue
}) => {
  const [displayValue, setDisplayValue] = useState(totalDepositValue);

  const handleCursor = useCallback((d?: DataPoint) => {
    setDisplayValue(d?.value || totalDepositValue)
  }, [totalDepositValue])
  
  return (
    <>
      <Box sx={{ px: 2 }}>
        <Stack gap={0.5}>
          <Typography color="gray">Total Silo Deposits</Typography>
          <Typography variant="h1" color="primary">
            ${displayValue.toLocaleString()}
          </Typography>
          <Typography>Season 5995</Typography>
        </Stack>
      </Box>
      <Box sx={{ width: '100%', height: '300px' }}>
        <SimpleGraph
          onCursor={handleCursor}
        />
      </Box>
    </>
  )
}

const OverviewCard : React.FC<{
  // FIXME: naming
  totalDepositValue: number;
}> = ({
  totalDepositValue = 109_609.82
}) => {
  const [tab, setTab] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Card>
      <Stack direction="row" justifyContent="space-between" sx={{ px: 2, pt: 2 }}>
        <Tabs value={tab} onChange={handleChange}>
          <Tab label="Deposits" />
          <Tab label="Stalk Ownership" />
        </Tabs>
        <Box>
          <Stack direction="row">
            {windows.map((w) => (
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
      {tab === 0 && (
        <DepositsTab
          totalDepositValue={totalDepositValue}
        />
      )}
      {tab === 1 && (
        <div>
          Stalk
        </div>
      )}
    </Card>
  );
}

export default OverviewCard;