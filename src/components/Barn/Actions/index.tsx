import React from 'react';
import { Box, Card, Stack, Tab, Tabs } from '@mui/material';

import useTabs from 'hooks/display/useTabs';
import BadgeTab from 'components/Common/BadgeTab';
import useFarmerFertilizer from 'hooks/redux/useFarmerFertilizer';
import Rinse from './Rinse';
import Buy from './Buy';

const BarnActions : React.FC<{}> = () => {
  const [tab, handleChange] = useTabs();
  const farmerFertilizer = useFarmerFertilizer();
  return (
    <Card sx={{ position: 'relative' }}>
      <Stack gap={1.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }} variant="scrollable">
            <Tab label="Buy" />
            <BadgeTab showBadge={farmerFertilizer.fertilized.gt(0)} label="Rinse" />
          </Tabs>
        </Stack>
        <Box sx={{ px: 1, pb: 1 }}>
          {tab === 0 ? (
            <Buy />
          ) : null}
          {tab === 1 ? (
            <Rinse />
          ) : null}
        </Box>
      </Stack>
    </Card>
  );
};

export default BarnActions;
