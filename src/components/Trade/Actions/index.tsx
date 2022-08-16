import { Box, Card, Stack, Typography } from '@mui/material';
import React from 'react';
import Trade from '~/components/Trade/Actions/Trade';

const TradeActions : React.FC<{}> = () => (
  <Card sx={{ position: 'relative' }}>
    <Stack gap={1.5}>
      <Box px={2} pt={2}>
        <Typography variant="h4">Swap</Typography>
      </Box>
      <Box px={1} pb={1}>
        <Trade />
      </Box>
    </Stack>
  </Card>
);
export default TradeActions;
