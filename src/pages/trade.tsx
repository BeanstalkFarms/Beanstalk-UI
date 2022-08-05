import React from 'react';
import {
  Container,
} from '@mui/material';
import TradeActions from '~/components/Trade/Actions';

const TradePage: React.FC = () => (
  <Container maxWidth="sm">
    <TradeActions />
  </Container>
);
export default TradePage;
