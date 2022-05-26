import { Container } from '@mui/system';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

const TransactionHistoryPage : React.FC = () => {
  const events = useSelector<AppState, AppState['_farmer']['events']>((state) => state._farmer.events);
  return (
    <Container maxWidth="xl">
      Events ({events.length})
    </Container>
  );
};

export default TransactionHistoryPage;
