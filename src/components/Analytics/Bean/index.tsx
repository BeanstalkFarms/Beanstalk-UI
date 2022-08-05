import React from 'react';
import { Card, Stack, Tab, Tabs } from '@mui/material';

import useTabs from 'hooks/display/useTabs';
import TWAP from './TWAP';
import Supply from './Supply';
import Soon from '../Soon';

const SLUGS = ['price', 'volume', 'liquidity', 'mktcap', 'supply', 'crosses'];
const BeanAnalytics: React.FC<{}> = () => {
  const [tab, handleChangeTab] = useTabs(SLUGS, 'bean');

  return (
    <Card>
      <Stack>
        <Tabs value={tab} onChange={handleChangeTab} sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Tab label="Bean Price" />
          <Tab label="Volume" />
          <Tab label="Liquidity" />
          <Tab label="Market Cap" />
          <Tab label="Supply" />
          <Tab label="Crosses" />
        </Tabs>
        {tab === 0 && <TWAP height={300} />}
        {tab === 1 && <Soon height={300} />}
        {tab === 2 && <Soon height={300} />}
        {tab === 3 && <Soon height={300} />}
        {tab === 4 && <Supply height={300} />}
        {tab === 5 && <Soon height={300} />}
      </Stack>
    </Card>
  );
};

export default BeanAnalytics;
