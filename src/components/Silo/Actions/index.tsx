import React, { useState } from 'react';
import { Box, Card, IconButton, Stack, Tab, Tabs } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { Token } from 'classes';
import Deposit from './Deposit';
import Withdraw from './Withdraw';

const Actions : React.FC<{ token: Token; }> = (props) => {
  const [tab, setTab] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0 }}>
            <Tab label="Deposit" />
            <Tab label="Withdraw" />
          </Tabs>
          <Box>
            <IconButton size="small">
              <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Stack>
        {/* Tabs */}
        <Box>
          {tab === 0 ? (
            <Box sx={{ position: 'relative' }}>
              <Deposit to={props.token} />
            </Box>
          ) : null}
          {tab === 1 ? (
            <Box sx={{ position: 'relative' }}>
              <Withdraw from={props.token} />
            </Box>
            // <Stack sx={{ p: 4 }} direction="row" justifyContent="center" alignItems="center">
            //   <Typography color="text.secondary">
            //     Withdrawals will be available once Beanstalk is Replanted.
            //   </Typography>
            // </Stack>
          ) : null}
        </Box>
      </Stack>
    </Card>
  );
};

export default Actions;
