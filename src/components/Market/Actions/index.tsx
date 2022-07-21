import { Box, Card, Stack, Tab, Tabs } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CreateOrder from './CreateOrder';
import CreateListing from './CreateListing';

const MarketActions : React.FC<{}> = () => {
  const [tab, setTab] = useState(0);
  const handleChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  }, []);
  const [searchParams] = useSearchParams();

  // opens page on "sell listing" tab if ?t=1 is in params
  const t = searchParams.get('t');
  useMemo(() => {
    if (t) {
      setTab(Number(t));
    }
  }, [t]);

  return (
    <Card sx={{ position: 'relative' }}>
      <Stack gap={1.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }} variant="scrollable">
            <Tab label="Create Order" />
            <Tab label="Create Listing" />
          </Tabs>
        </Stack>
        <Box sx={{ px: 1, pb: 1 }}>
          {tab === 0 && <CreateOrder />}
          {tab === 1 && <CreateListing />}
        </Box>
      </Stack>
    </Card>
  );
};

export default MarketActions;
