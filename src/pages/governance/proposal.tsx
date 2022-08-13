import React from 'react';
import {
  Container,
  Stack
} from '@mui/material';

import PageHeader from '~/components/Common/PageHeader';

const ProposalPage: React.FC = () => (
  <Container maxWidth="lg">
    <Stack gap={2}>
      <PageHeader
        title="proposal"
      />
      {/* page content */}
    </Stack>
  </Container>
);

export default ProposalPage;
