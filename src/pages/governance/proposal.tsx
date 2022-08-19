import React from 'react';
import {
  Container, Grid,
  Stack
} from '@mui/material';
import PageHeader from '~/components/Common/PageHeader';
import GovernanceActions from '~/components/Governance/Actions';
import ProposalContent from '~/components/Governance/ProposalContent';

const ProposalPage: React.FC = () => (
  <Container maxWidth="lg">
    <Stack gap={2}>
      <PageHeader returnPath="/governance" />
      <Grid container direction={{ xs: 'column-reverse', md: 'row' }} spacing={2}>
        <Grid item xs={12} md={8}>
          <ProposalContent />
        </Grid>
        <Grid item xs={12} md={4}>
          <GovernanceActions />
        </Grid>
      </Grid>
    </Stack>
  </Container>
  );

export default ProposalPage;
