import React, { useState } from 'react';
import { Badge, Box, Card, IconButton, Stack, Tab, Tabs } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { Token } from 'classes';
import { FarmerSiloBalance } from 'state/farmer/silo';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Claim from './Claim';

const Actions : React.FC<{
  token: Token;
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
    <Card sx={{ p: 2 }}>
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
          <Box>
            <IconButton size="small">
              <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Stack>
        {/* Tab Content */}
        <Box>
          {tab === 0 ? (
            <Box sx={{ position: 'relative' }}>
              <Deposit token={props.token} />
            </Box>
          ) : null}
          {tab === 1 ? (
            <Box sx={{ position: 'relative' }}>
              <Withdraw token={props.token} />
            </Box>
            // <Stack sx={{ p: 4 }} direction="row" justifyContent="center" alignItems="center">
            //   <Typography color="text.secondary">
            //     Withdrawals will be available once Beanstalk is Replanted.
            //   </Typography>
            // </Stack>
          ) : null}
          {tab === 2 ? (
            <Box sx={{ position: 'relative' }}>
              <Claim
                token={props.token}
                siloBalance={props.siloBalance}
              />
            </Box>
          ) : null}
        </Box>
      </Stack>
    </Card>
  );
};

export default Actions;
