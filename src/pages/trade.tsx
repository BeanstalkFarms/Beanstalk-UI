import React from 'react';
import {
  Card,
  Container,
  Stack,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import Soon from 'components/Analytics/Soon';

const TradePage: React.FC = () => (
  <Container maxWidth="sm">
    <Stack spacing={2}>
      <PageHeader title="Trade" description="Trade between two tokens" />
      {/* <TradeActions /> */}
      <Card><Soon /></Card>
    </Stack>
  </Container>
);
export default TradePage;
