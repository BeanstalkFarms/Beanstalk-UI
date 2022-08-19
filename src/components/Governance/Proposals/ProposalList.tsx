import React from 'react';
import { Box, CircularProgress, Stack } from '@mui/material';
import EmptyState from '~/components/Common/ZeroState/EmptyState';
import ProposalButton from '~/components/Governance/Proposals/ProposalButton';
import { Proposal } from '~/util/Governance';

const ProposalList: React.FC<{ proposals: Proposal[] }> = (props) => {
  // Null state
  if (!props.proposals) {
    return (
      <Box height={100} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Stack px={1} pb={1} gap={1}>
      {props.proposals.length === 0 ? (
        <EmptyState message="No proposals of this type." />
      ) : (
        <>
          {props.proposals.map((p) => (
            <ProposalButton proposal={p} />
          ))}
        </>
      )}
    </Stack>
  );
};

export default ProposalList;
