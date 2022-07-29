import { Card, Stack, Tab, Tabs } from '@mui/material';
import useTabs from 'hooks/display/useTabs';
import React from 'react';
import Soon from '../Soon';

const SLUGS = [
  'deposited_bean',
  'withdrawn_bean',
  'deposited_lp',
  'withdrawn_lp',
  'deposited_urbean',
  'deposited_urlp',
  'stalk',
  'seeds',
];

const SiloAnalytics: React.FC<{}> = () => {
  const [tab, handleChangeTab] = useTabs(SLUGS, 'silo');
  return (
    <Card>
      <Stack gap={2}>
        <Tabs value={tab} onChange={handleChangeTab} sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Tab label="Deposited Beans" />
          <Tab label="Withdrawn Beans" />
          <Tab label="Deposited LP" />
          <Tab label="Withdrawn LP" />
          <Tab label="Deposited Unripe Beans" />
          <Tab label="Deposited Unripe LP" />
          <Tab label="Stalk" />
          <Tab label="Seeds" />
        </Tabs>
        {tab === 0 && <Soon height={300} />}
        {tab === 1 && <Soon height={300} />}
        {tab === 2 && <Soon height={300} />}
        {tab === 3 && <Soon height={300} />}
        {tab === 4 && <Soon height={300} />}
        {tab === 5 && <Soon height={300} />}
        {tab === 6 && <Soon height={300} />}
        {tab === 7 && <Soon height={300} />}
        {/* {tab === 0 && <DepositedBeans season={season} beanPrice={beanPrice} />}
        {tab === 1 && <WithdrawnBeans season={season} beanPrice={beanPrice} />}
        {tab === 2 && <DepositedLP season={season} beanPrice={beanPrice} />}
        {tab === 3 && <WithdrawnLP season={season} beanPrice={beanPrice} />}
        {tab === 4 && (<DepositedUnripeBeans season={season} beanPrice={beanPrice} />)}
        {tab === 5 && <DepositedUnripeLP season={season} beanPrice={beanPrice} />}
        {tab === 6 && <Stalk season={season} beanPrice={beanPrice} />}
        {tab === 7 && <Seeds season={season} beanPrice={beanPrice} />} */}
      </Stack>
    </Card>
  );
};
export default SiloAnalytics;
