import React from 'react';
import {
  Container,
  Stack, Typography,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import { useParams } from 'react-router-dom';

const OrderPage: React.FC = () => {
  // id of pod order
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeader
          returnPath="/market"
        />
        <Typography>POD ORDER</Typography>
        <Typography>ID: {id}</Typography>
      </Stack>
    </Container>
  );
};
export default OrderPage;
