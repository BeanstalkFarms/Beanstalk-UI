import { Box, Card, Stack, Tab, Tabs } from '@mui/material';
import React, { useCallback, useState } from 'react';
import Harvest from '../../Field/Actions/Harvest';
import BuyOrder from './BuyOrder';
import SellListing from './SellListing';

const MarketActions : React.FC<{}> = () => {
  const [tab, setTab] = useState(0);
  const handleChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  }, []);
  return (
    <Card sx={{ position: 'relative' }}>
      <Stack gap={1.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }} variant="scrollable">
            <Tab label="Create Buy Order" />
            <Tab label="Create Sell Listing" />
          </Tabs>
        </Stack>
        <Box sx={{ px: 1, pb: 1 }}>
          {tab === 0 && <BuyOrder />}
          {tab === 1 && <SellListing />}
        </Box>
      </Stack>
    </Card>
  );
};

export default MarketActions;
