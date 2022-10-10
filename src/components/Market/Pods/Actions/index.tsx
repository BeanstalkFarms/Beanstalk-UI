import { Box, Card, Stack, Tab, Tabs } from '@mui/material';
import React from 'react';
import useTabs from '~/hooks/display/useTabs';
import CreateOrder from './CreateOrder';
import CreateListing from './CreateListing';
import Row from '~/components/Common/Row';
import { FC } from '~/types';

const SLUGS = ['order', 'list'];

const MarketActions : FC<{}> = () => {
  const [tab, handleChange] = useTabs(SLUGS, 'action');
  return (
    <Card sx={{ position: 'relative' }}>
      <Stack gap={1.5}>
        {/* Header */}
        <Row justifyContent="space-between" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }} variant="scrollable">
            <Tab label="Order" />
            <Tab label="List" />
          </Tabs>
        </Row>
        <Box sx={{ px: 1, pb: 1 }}>
          {tab === 0 && <CreateOrder />}
          {tab === 1 && <CreateListing />}
        </Box>
      </Stack>
    </Card>
  );
};

export default MarketActions;