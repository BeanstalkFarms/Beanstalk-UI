import React from 'react';
import {
  Container,
  Stack,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import TradeActions from 'components/Trade/Actions';

const TradePage: React.FC = () => (
  <Container maxWidth="sm">
    <Stack spacing={2}>
      <PageHeader title="Trade" description="Trade between two tokens" />
      <TradeActions />
    </Stack>
  </Container>
);
export default TradePage;
