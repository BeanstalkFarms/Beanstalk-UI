import React from 'react';
import { Card, Stack, Tab, Tabs } from '@mui/material';

import useTabs from 'hooks/display/useTabs';
import TWAP from './TWAP';

const BeanAnalytics: React.FC<{}> = () => {
  const [tab, handleChangeTab] = useTabs();

  return (
    <Card>
      <Stack>
        <Tabs value={tab} onChange={handleChangeTab} sx={{ px: 2, pt: 2 }}>
          <Tab label="Bean Price" />
          <Tab label="Volume" />
          <Tab label="Liquidity" />
          <Tab label="Market Cap" />
          <Tab label="Supply" />
          <Tab label="Crosses" />
        </Tabs>
        {tab === 0 && <TWAP height={300} />}
        {/* {tab === 1 && <Volume season={season} beanPrice={beanPrice} />}
          {tab === 2 && <Liquidity season={season} beanPrice={beanPrice} />}
          {tab === 3 && <MarketCap season={season} beanPrice={beanPrice} />}
          {tab === 4 && <Supply season={season} beanPrice={beanPrice} />}
          {tab === 5 && <Crosses season={season} beanPrice={beanPrice} />} */}
      </Stack>
    </Card>
  );
};

export default BeanAnalytics;
