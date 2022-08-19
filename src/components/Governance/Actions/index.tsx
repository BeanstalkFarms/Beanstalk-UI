import { Box, Card, Stack, Typography } from '@mui/material';
import React from 'react';
import Vote from '~/components/Governance/Actions/Vote';

const GovernanceActions : React.FC = () => (
  <Card sx={{ position: 'sticky', top: 120 }}>
    <Stack gap={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
        <Typography variant="h4">Results</Typography>
      </Stack>
      <Box sx={{ px: 1, pb: 1 }}>
        <Vote />
      </Box>
    </Stack>
  </Card>
);

export default GovernanceActions;
