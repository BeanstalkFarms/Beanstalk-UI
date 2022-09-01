import React from 'react';
import {
  Button,
  Stack,
  Typography,
} from '@mui/material';
import MoreDropdown from '~/components/Market/Pods/MoreDropdown';

const CreateButtons: React.FC = () => (
  <Stack direction="row" gap={1} alignItems="end" height="100%">
    <MoreDropdown />
    <Button
      href="#/market/pods/create"
      color="primary"
      variant="contained"
      sx={{ py: 1 }}
    >
      <Typography variant="h4">Create New</Typography>
    </Button>
  </Stack>
);
export default CreateButtons;
