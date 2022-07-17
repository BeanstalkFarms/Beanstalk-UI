import React from 'react';
import { Container, Stack } from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import ChopActions from '../components/Chop/Actions';

const ChopPage: React.FC = () => (
  <Container maxWidth="sm">
    <Stack spacing={2}>
      <PageHeader title="Chop" description="Chop your unripe beans" />
      <ChopActions />
    </Stack>
  </Container>
);
export default ChopPage;
