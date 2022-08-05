import { Box, Card, Link, Stack, Typography } from '@mui/material';
import Soon from '~/components/Analytics/Soon';
import React from 'react';

const TradeActions : React.FC<{}> = () => (
  <Card sx={{ position: 'relative' }}>
    <Stack gap={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
        <Typography variant="h4">Trade</Typography>
      </Stack>
      <Box sx={{ px: 1, pb: 1, position: 'relative' }}>
        {/* <Trade /> */}
        <Soon>
          This module is under development. Trade Beans directly via the Curve website: <strong><Link href="https://curve.fi/factory/152" target="_blank" rel="noreferrer">https://curve.fi/factory/152</Link></strong>
        </Soon>
      </Box>
    </Stack>
  </Card>
);
export default TradeActions;
