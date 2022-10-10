import React from 'react';
import {
  Button,
  Typography,
} from '@mui/material';
import MoreDropdown from '~/components/Market/Pods/MoreDropdown';
import Row from '~/components/Common/Row';

import { FC } from '~/types';

const CreateButtons: FC<{}> = () => (
  <Row gap={1} alignItems="end" height="100%">
    <MoreDropdown />
    <Button
      href="#/market/create"
      color="primary"
      variant="contained"
      sx={{ py: 1 }}
    >
      <Typography variant="h4">Create New</Typography>
    </Button>
  </Row>
);
export default CreateButtons;
