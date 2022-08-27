import { Card, Tab, Tabs } from '@mui/material';
import React from 'react';
// import DepositedBeans from './DepositedBeans';
// import DepositedBean3CRV from './DepositedBean3Crv';
// import DepositedUnripeBeans from './DepositedUnripeBeans';
// import DepositedUnripeBean3CRV from './DepositedUnripeBean3Crv';
// import Stalk from './Stalk';
// import Seeds from './Seeds';
import useTabs from '~/hooks/display/useTabs';
import Soon from '~/components/Common/ZeroState/Soon';

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
      <Tabs value={tab} onChange={handleChangeTab} sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Tab label="Deposited BEAN" />
        <Tab label="Deposited BEAN:3CRV" />
        <Tab label="Deposited urBEAN" />
        <Tab label="Deposited urBEAN3CRV" />
        <Tab label="Stalk" />
        <Tab label="Seeds" />
      </Tabs>
      {/* {tab === 0 && <DepositedBeans height={300} />}
      {tab === 1 && <DepositedBean3CRV height={300} />}
      {tab === 2 && <DepositedUnripeBeans height={300} />}
      {tab === 3 && <DepositedUnripeBean3CRV height={300} />}
      {tab === 4 && <Stalk height={300} />}
      {tab === 5 && <Seeds height={300} />} */}
      {tab === 0 && <Soon />}
      {tab === 1 && <Soon />}
      {tab === 2 && <Soon />}
      {tab === 3 && <Soon />}
      {tab === 4 && <Soon />}
      {tab === 5 && <Soon />}
    </Card>
  );
};
export default SiloAnalytics;
