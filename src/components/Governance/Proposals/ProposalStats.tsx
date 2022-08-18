import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { getDateMessage } from '~/util/Governance';

const ProposalStats: React.FC<{ proposal: any }> = (props) => (
  <Stack direction={{ xs: 'column', lg: 'row' }} alignItems={{ xs: 'start', lg: 'center' }} gap={{ xs: 0, lg: 2 }}>
    <Stack direction="row" display="inline-flex" alignItems="center" gap={0.5}>
      <Box
        className="B-badge"
        sx={{
            opacity: 0.7,
            width: 8,
            height: 8,
            backgroundColor: props.proposal.state === 'active' ? 'primary.main' : 'gray',
            borderRadius: 4
          }}
        />
      <Typography
        variant="body1">{props.proposal.state.charAt(0).toUpperCase() + props.proposal.state.slice(1)}
      </Typography>
    </Stack>
    <Typography variant="body1">{getDateMessage(props.proposal.end)}</Typography>
  </Stack>
  );

export default ProposalStats;
