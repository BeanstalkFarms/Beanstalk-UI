import React from 'react';
import {
  Button,
  Stack,
  Typography,

} from '@mui/material';

const CreateButtons: React.FC = () => (
  <Stack direction="row" gap={1} alignItems="end" height="100%">
    <Button
      href="#/market/create"
      color="inverse"
      variant="contained"
      sx={{ py: 1 }}
      >
      <Typography variant="h4">Create Pod Order</Typography>
    </Button>
    {/* ?t=1 sets the tab in Market/Actions/index.tsx */}
    <Button
      href="#/market/create?t=1"
      color="primary"
      variant="contained"
      sx={{ py: 1 }}
      >
      <Typography variant="h4">Create Pod Listing</Typography>
    </Button>
  </Stack>
  );
export default CreateButtons;
