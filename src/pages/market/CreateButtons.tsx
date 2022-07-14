import React from 'react';
import {
  Button,
  Stack,
  Typography,

} from '@mui/material';

const CreateButtons: React.FC = () => {
  return (
    <Stack direction="row" gap={1} alignItems="end" height="100%">
      <Button
        href="https://dune.com/tbiq/beanstalk-barn-raise"
        target="_blank"
        rel="noreferrer"
        color="primary"
        variant="contained"
        sx={{ py: 1 }}
      >
        <Typography variant="h4">Create Buy Order</Typography>
      </Button>
      <Button
        href="https://bean.money/blog/how-to-purchase-fertilizer"
        target="_blank"
        rel="noreferrer"
        color="primary"
        variant="contained"
        sx={{ py: 1 }}
      >
        <Typography variant="h4">Create Sell Listing</Typography>
      </Button>
    </Stack>
  );
};
export default CreateButtons;
