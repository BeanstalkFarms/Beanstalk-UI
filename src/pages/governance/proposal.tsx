import React from 'react';
import {
  Box,
  Card, CircularProgress,
  Container, Grid,
  Stack, Typography
} from '@mui/material';
import { useParams } from 'react-router-dom';
import PageHeader from '~/components/Common/PageHeader';
import GovernanceActions from '~/components/Governance/Actions';
import ProposalContent from '~/components/Governance/Proposal';
import { useProposalQuery, useProposalQuorumQuery } from '~/generated/graphql';
import { Proposal } from '~/util/Governance';
import PageNotFound from '~/pages/error/404';

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
  console.log('PROP START', proposal?.start);

  const { loading: loading2, error: error2, data: data2 } = useProposalQuorumQuery({
    variables: { created_at: proposal?.start },
    context: { subgraph: 'snapshot' },
    fetchPolicy: 'cache-and-network',
    // fetchPolicy: 'cache-and-network',
  });
  console.log('QUORUM: ', data2);

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
    return <PageNotFound />;
  }

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader returnPath="/governance" />
        <Grid container direction={{ xs: 'column-reverse', md: 'row' }} spacing={{ xs: 0, md: 2 }} gap={{ xs: 2, md: 0 }} maxWidth="100%">
          <Grid item xs={12} md={8} maxWidth="100% !important">
            <ProposalContent proposal={proposal} />
          </Grid>
          <Grid item xs={12} md={4} maxWidth="100%">
            <GovernanceActions proposal={proposal} />
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default ProposalPage;
