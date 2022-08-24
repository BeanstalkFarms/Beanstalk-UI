import React from 'react';
import { Box, Card, Divider, Stack, Typography } from '@mui/material';
import MarkdownWrapper from '~/components/Common/MarkdownWrapper';
import ProposalStats from '~/components/Governance/Proposals/ProposalStats';
import { Proposal } from '~/util/Governance';

const ProposalContent: React.FC<{proposal: Proposal}> = (props) => (
  <Card sx={{ p: 2 }}>
    <Stack gap={1}>
      {/* Title & stats */}
      <Typography variant="h2">{props.proposal?.title}</Typography>
      <ProposalStats proposal={props.proposal} showLink />
      <Divider sx={{ mt: 1 }}  />
      {/* Markdown */}
      <Box maxWidth="100%">
        <MarkdownWrapper>{props.proposal?.body}</MarkdownWrapper>
      </Box>
    </Stack>
  </Card>
  );

export default ProposalContent;
