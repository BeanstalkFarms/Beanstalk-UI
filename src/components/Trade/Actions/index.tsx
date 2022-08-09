import { Alert, Box, Card, Stack, Typography } from '@mui/material';
import React from 'react';
import Soon from '~/components/Common/ZeroState/Soon';

const TradeActions : React.FC<{}> = () => (
  <Card sx={{ position: 'relative' }}>
    <Stack gap={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
        <Typography variant="h4">Trade</Typography>
      </Stack>
      <Box sx={{ px: 1, pb: 1, position: 'relative' }}>
        {/* <Trade /> */}
        <Soon>
          This module is under development.
          <Alert severity="warning" sx={{ mt: 1 }}>There is a reported DNS attack on the curve.fi website. Do NOT trade Beans via the Curve website.</Alert>
          {/* Trade Beans directly via the Curve website: <strong><Link href="https://curve.fi/factory/152" target="_blank" rel="noreferrer">https://curve.fi/factory/152</Link></strong> */}
        </Soon>
      </Box>
    </Stack>
  </Card>
);
export default TradeActions;
