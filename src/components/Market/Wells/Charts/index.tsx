import React from 'react';
import { Card, Tab, Tabs } from '@mui/material';

import useTabs from '~/hooks/display/useTabs';
import Supply from '~/components/Analytics/Bean/Supply';
import MarketCap from '~/components/Analytics/Bean/MarketCap';
import Volume from '~/components/Analytics/Bean/Volume';
import Liquidity from '~/components/Analytics/Bean/Liquidity';

const SLUGS = ['price', 'volume', 'liquidity', 'mktcap', 'supply', 'crosses'];
const WellCharts: React.FC<{}> = () => {
  const [tab, handleChangeTab] = useTabs(SLUGS, 'bean');

  return (
    <Card>
      <Tabs value={tab} onChange={handleChangeTab} sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Tab label="Liquidity" />
        <Tab label="Volume" />
        <Tab label="deltaB" />
        <Tab label="Price" />
      </Tabs>
      {tab === 0 && <Liquidity height={240} />}
      {tab === 1 && <Volume height={240} />}
      {tab === 2 && <MarketCap height={240} />}
      {tab === 3 && <Supply height={240} />}
    </Card>
  );
};

export default WellCharts;
