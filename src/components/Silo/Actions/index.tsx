import React, { useState } from 'react';
import { Badge, Card, Stack, Tab, Tabs } from '@mui/material';
import { Pool } from 'classes';
import { ERC20Token } from 'classes/Token';
import { FarmerSiloBalance } from 'state/farmer/silo';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Claim from './Claim';

const Actions : React.FC<{
  pool: Pool;
  token: ERC20Token;
  siloBalance: FarmerSiloBalance;
}> = (props) => {
  const [tab, setTab] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const isClaimVisible = (
    props.siloBalance?.withdrawn?.amount.gt(0)
    || props.siloBalance?.claimable?.amount.gt(0)
  );

  return (
    <Card sx={{ p: 2, position: 'relative' }}>
      <Stack gap={1.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible' }}>
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }} variant="scrollable">
            <Tab label="Deposit" />
            <Tab label="Withdraw" />
            {isClaimVisible ? (
              <Tab label={<Badge color="primary" variant="dot">Claim</Badge>} sx={{ overflow: 'visible' }} />
            ) : null}
          </Tabs>
        </Stack>
        {/* Tab Content */}
        {tab === 0 ? (
          <Deposit
            pool={props.pool}
            siloToken={props.token}
          />
        ) : null}
        {tab === 1 ? (
          <Withdraw
            token={props.token}
          />
        ) : null}
        {tab === 2 ? (
          <Claim
            token={props.token}
            siloBalance={props.siloBalance}
          />
        ) : null}
      </Stack>
    </Card>
  );
};

export default Actions;

// <Stack sx={{ p: 4 }} direction="row" justifyContent="center" alignItems="center">
//   <Typography color="text.secondary">
//     Withdrawals will be available once Beanstalk is Replanted.
//   </Typography>
// </Stack>
