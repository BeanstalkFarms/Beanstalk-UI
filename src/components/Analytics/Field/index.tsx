import React from 'react';

import { Card, Stack, Tabs, Tab } from '@mui/material';
import useTabs from 'hooks/display/useTabs';
import HarvestedPods from './HarvestedPods';
import PodRate from './PodRate';
import Pods from './Pods';
import Weather from './Weather';
import Sown from './Sown';
import TotalSowers from './TotalSowers';

const SLUGS = ['rror', 'weather', 'pods', 'podrate', 'sown', 'harvested', 'sowers'];
const FieldAnalytics: React.FC<{}> = () => {
  const [tab, handleChangeTab] = useTabs(SLUGS, 'field');
  return (
    <Card>
      <Stack>
        <Tabs value={tab} onChange={handleChangeTab} sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Tab label="RRoR" />
          <Tab label="Weather" />
          <Tab label="Pods" />
          <Tab label="Pod Rate" />
          <Tab label="Sown" />
          <Tab label="Harvested" />
          <Tab label="TotalSowers" />
        </Tabs>
        {/* {tab === 0 && <RRoR season={season} beanPrice={beanPrice} />} */}
        {tab === 1 && <Weather />}
        {tab === 2 && <Pods />}
        {tab === 3 && <PodRate />}
        {tab === 4 && <Sown />}
        {tab === 5 && <HarvestedPods />}
        {tab === 6 && <TotalSowers />}
      </Stack>
    </Card>
  );
};

export default FieldAnalytics;
