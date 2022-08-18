import React from 'react';
import { Stack } from '@mui/material';
import EmptyState from '~/components/Common/ZeroState/EmptyState';
import ProposalButton from '~/components/Governance/Proposals/ProposalButton';

const ProposalList: React.FC<{ proposals: any; }> = (props) => {
  // Null state
  if (props.proposals === undefined) {
    return null;
  }
  
  return (
    <Stack px={2} pb={2} gap={2}>
      <Stack gap={2}>
        {props.proposals.length === 0 ? (
          <EmptyState message="No proposals of this type." />
        ) : (
          <>
            {props.proposals.map((p: any) => (
              <ProposalButton proposal={p} />
            ))}
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default ProposalList;
