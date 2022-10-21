import React from 'react';
import {
  Container,
  Stack,
} from '@mui/material';
import PageHeader from '~/components/Common/PageHeader';
import MarketActions from '../../../components/Market/Pods/Actions';

import { FC } from '~/types';

const CreatePage: FC<{}> = () => (
  <Container maxWidth="sm">
    <Stack spacing={2}>
      <PageHeader returnPath="/market/account" />
      <MarketActions />
    </Stack>
  </Container>
);

export default CreatePage;
