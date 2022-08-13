import React from 'react';
import {
  Container,
  Stack
} from '@mui/material';

import PageHeader from '~/components/Common/PageHeader';
import Proposals from '~/components/Governance/Proposals';

const GovernancePage: React.FC = () => (
  <Container maxWidth="md">
    <Stack gap={2}>
      <PageHeader
        title="Governance"
        description="Participate in Beanstalk governance as a Stalkholder"
      />
      <Proposals />
      {/* page content */}
    </Stack>
  </Container>
);

export default GovernancePage;
