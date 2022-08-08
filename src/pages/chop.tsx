import React from 'react';
import {
  Container,
  Stack,
} from '@mui/material';
import PageHeader from '~/components/Common/PageHeader';
import ChopActions from '~/components/Chop/Actions';
import ChopConditions from '../components/Chop/ChopConditions';

const ChopPage: React.FC = () => (
  <Container maxWidth="sm">
    <Stack spacing={2}>
      <PageHeader 
        title="Chop" 
        description="Burn your Unripe assets for the underlying Ripe assets" 
        href="https://docs.bean.money/farm/barn#chopping"
      />
      <ChopConditions />
      <ChopActions />
    </Stack>
  </Container>
);
export default ChopPage;
