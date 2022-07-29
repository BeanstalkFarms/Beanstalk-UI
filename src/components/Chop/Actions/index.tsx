import { Box, Card, Stack, Typography } from '@mui/material';
import React from 'react';
import Chop from './Chop';

const ChopActions : React.FC<{}> = () => (
  <Card sx={{ position: 'relative' }}>
    <Stack gap={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
        <Typography variant="h4">Chop</Typography>
      </Stack>
      <Box sx={{ px: 1, pb: 1 }}>
        <Chop />
      </Box>
    </Stack>
  </Card>
);
export default ChopActions;
