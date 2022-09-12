import React from 'react';
import {
  Container,
  Stack,
} from '@mui/material';
import PageHeader from '~/components/Common/PageHeader';
import MarketActions from '../../../components/Market/Pods/Actions';

const CreatePage: React.FC = () => (
  <Container maxWidth="sm">
    <Stack spacing={2}>
      <PageHeader returnPath="/market/pods/account" />
      <MarketActions />
    </Stack>
  </Container>
);

export default CreatePage;