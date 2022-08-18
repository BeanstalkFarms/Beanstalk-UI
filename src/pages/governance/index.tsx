import React from 'react';
import {
  Container, Grid,
  Stack
} from '@mui/material';
import PageHeader from '~/components/Common/PageHeader';
import Proposals from '~/components/Governance/Proposals';
import StalkholderCard from '~/components/Governance/StalkholderCard';

const GovernancePage: React.FC = () => (
  <Container maxWidth="lg">
    <Stack gap={2}>
      <PageHeader
        title="Governance"
        description="Participate in Beanstalk governance as a Stalkholder"
      />
      <Grid container direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Grid item xs={12} md={4}>
          <StalkholderCard />
        </Grid>
        <Grid item xs={12} md={8}>
          <Proposals />
        </Grid>
      </Grid>
    </Stack>
  </Container>
);

export default GovernancePage;
