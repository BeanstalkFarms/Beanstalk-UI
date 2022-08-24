import React from 'react';
import {
  Box,
  Card, CircularProgress,
  Container, Grid,
  Stack, Typography
} from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';
import PageHeader from '~/components/Common/PageHeader';
import GovernanceActions from '~/components/Governance/Actions';
import ProposalContent from '~/components/Governance/Proposal';
import { useProposalQuery } from '~/generated/graphql';
import { Proposal } from '~/util/Governance';

const ProposalPage: React.FC = () => {
  /// Routing
  const { id } = useParams<{ id: string }>();

  /// Query: Proposal
  const { loading, error, data } = useProposalQuery({
    variables: { proposal_id: id || '' },
    context: { subgraph: 'snapshot' },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'network-only',
    skip: !id
  });
  const proposal = data?.proposal as Proposal;

  /// Loading or Error
  if (loading || error) {
    return (
      <>
        {error ? (
          <Card>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Typography>Error: {error.message}</Typography>
            </Box>
          </Card>
        ) : (
          <Box height={300} display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        )}
      </>
    );
  }

  /// Finished loading but no proposal
  if ((!loading && data?.proposal === null) || !id) {
    return <Navigate replace to="/404" />;
  }

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader returnPath="/governance" />
        <Grid container direction={{ xs: 'column-reverse', md: 'row' }} spacing={2}>
          <Grid item xs={12} md={8}>
            <ProposalContent proposal={proposal} />
          </Grid>
          <Grid item xs={12} md={4}>
            <GovernanceActions proposal={proposal} />
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default ProposalPage;
