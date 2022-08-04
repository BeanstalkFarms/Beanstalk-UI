import React from 'react';
import {
  Card,
  Container,
  Stack,
} from '@mui/material';
import Soon from 'components/Analytics/Soon';

const TradePage: React.FC = () => (
  <Container maxWidth="sm">
    <Stack spacing={2}>
      {/* <TradeActions /> */}
      <Card><Soon /></Card>
    </Stack>
  </Container>
);
export default TradePage;
