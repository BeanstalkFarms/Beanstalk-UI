import React, { useMemo } from 'react';
import { Box, Card, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { ProposalDocument } from '~/generated/graphql';
import useGovernanceQuery from '~/hooks/useGovernanceQuery';
import MarkdownWrapper from '~/components/Common/MarkdownWrapper';
import ProposalStats from '~/components/Governance/Proposals/ProposalStats';

const ProposalContent: React.FC = () => {
  /// Routing
  const { id } = useParams<{ id: string }>();

  /// Query proposal data
  const queryConfig = useMemo(() => ({
    variables: { proposal_id: id }
  }), [id]);
  const { loading, data } = useGovernanceQuery(ProposalDocument, queryConfig);
  
  /// Loading
  if (loading || data === undefined) {
    return (
      <Card>
        <Box height={300} display="flex" alignItems="center" justifyContent="center">
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1}>
        {/* title & stats */}
        <Typography variant="h2">{data?.proposal?.title}</Typography>
        <ProposalStats proposal={data?.proposal} />
        <Divider sx={{ mt: 1 }}  />
        {/* markdown */}
        <Box maxWidth="100%">
          <MarkdownWrapper>{data?.proposal?.body}</MarkdownWrapper>
        </Box>
      </Stack>
    </Card>
  );
};

export default ProposalContent;
