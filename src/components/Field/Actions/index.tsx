import { Box, Card, Stack, Tab, Tabs } from '@mui/material';
import React, { useCallback, useState } from 'react';
import Sow from './Sow';
import Send from './Send';
import Harvest from './Harvest';

const FieldActions : React.FC<{}> = () => {
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
