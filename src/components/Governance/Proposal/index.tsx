import React from 'react';
import { Box, Card, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';
import { useProposalQuery } from '~/generated/graphql';
import MarkdownWrapper from '~/components/Common/MarkdownWrapper';
import ProposalStats from '~/components/Governance/Proposals/ProposalStats';
import { Proposal } from '~/util/Governance';

const ProposalContent: React.FC = () => {
  /// Routing
  const { id } = useParams<{ id: string }>();

  /// Query proposal data
  const { loading, error, data } = useProposalQuery({
    variables: { proposal_id: id || '' },
    context: { subgraph: 'snapshot' },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'network-only',
    skip: !id
  });

  if (!loading && data?.proposal === null) {
    return <Navigate replace to="/404" />;
  }

  const proposal = data?.proposal as Proposal;
  
  /// Loading
  if (loading || error || !data || !proposal) {
    return (
      <Card>
        <Box height={300} display="flex" alignItems="center" justifyContent="center">
          {error ? (
            <Typography>Error: {error.message}</Typography>
          ) : (
            <CircularProgress />
          )}
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1}>
        {/* Title & stats */}
        <Typography variant="h2">{proposal?.title}</Typography>
        <ProposalStats proposal={proposal} showLink />
        <Divider sx={{ mt: 1 }}  />
        {/* Markdown */}
        <Box maxWidth="100%">
          <MarkdownWrapper>{proposal?.body}</MarkdownWrapper>
        </Box>
      </Stack>
    </Card>
  );
};

export default ProposalContent;
