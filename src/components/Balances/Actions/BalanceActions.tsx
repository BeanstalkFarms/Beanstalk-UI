import { Box, Stack } from '@mui/material';
import React from 'react';
import SiloRewards from '../SiloRewards';
import QuickHarvest from './QuickHarvest';
import QuickRinse from './QuickRinse';

const BalanceActions: React.FC<{}> = () => (
  <Stack width={{ xs: '100%', lg: '360px' }} sx={{ flexShrink: 0 }} gap={1}>
    <Stack direction={{ xs: 'column', md: 'row', lg: 'column' }} gap={1}>
      <Box width="100%">
        <QuickHarvest />
      </Box>
      <Box width="100%">
        <QuickRinse />
      </Box>
    </Stack>
    <SiloRewards />
  </Stack>
);

export default BalanceActions;
