import { Card, Stack, Tab, Tabs } from '@mui/material';
import React, { useCallback, useState } from 'react';
import Sow from './Sow';

const FieldActions : React.FC<{}> = () => {
  const [tab, setTab] = useState(0);
  const handleChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  }, []);
  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible' }}>
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }} variant="scrollable">
            <Tab label="Sow" />
            <Tab label="Send" />
          </Tabs>
        </Stack>
        {tab === 0 ? (
          <Sow />
        ) : null}
      </Stack>
    </Card>
  );
}

export default FieldActions;