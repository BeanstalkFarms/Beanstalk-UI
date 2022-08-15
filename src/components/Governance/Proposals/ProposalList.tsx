import React from 'react';
import { Stack, Typography } from '@mui/material';

const ProposalList: React.FC<{ title: string; proposals: any; }> = (props) => {
  if (props.proposals === undefined) {
    return null;
  }
  return (
    <Stack px={2}>
      <Typography>{props.title}</Typography>
      <Stack>
        {props.proposals.map((p: any) => (
          <>
            <Typography>{p.title}</Typography>
          </>
        ))}
      </Stack>
    </Stack>
  );
};

export default ProposalList;
