import React from 'react';
import { Box, Card, Stack, Tab, Tabs } from '@mui/material';
import useTabs from 'hooks/display/useTabs';
import Sow from './Sow';
import Send from './Send';
import Harvest from './Harvest';

const SLUGS = ['sow', 'harvest', 'send'];
const FieldActions : React.FC<{}> = () => {
  const [tab, handleChange] = useTabs(SLUGS, 'action');
  return (
    <Card sx={{ position: 'relative' }}>
      <Stack gap={1.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }} variant="scrollable">
            <Tab label="Sow" />
            <Tab label="Harvest" />
            <Tab label="Send" />
          </Tabs>
        </Stack>
        <Box sx={{ px: 1, pb: 1 }}>
          {tab === 0 && <Sow />}
          {tab === 1 && <Harvest />}
          {tab === 2 && <Send />}
        </Box>
      </Stack>
    </Card>
  );
};

export default FieldActions;
