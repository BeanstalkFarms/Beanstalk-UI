import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { getDateMessage } from '~/util/Governance';
import { displayBN } from '~/util';

const ProposalStats: React.FC<{ proposal: any, differenceInTime?: number, totalStalk?: BigNumber }> = (props) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
    <Stack direction="row" alignItems="center" gap={2}>
      <Stack direction="row" alignItems="center" gap={0.5}>
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

    {/* if there is time remaining... */}
    {(props.differenceInTime && props.totalStalk && props.differenceInTime > 0) && (
      <Stack direction="row" alignItems="center" gap={0.5} display={{ xs: 'none', md: 'block' }}>
        <Typography textAlign={{ xs: 'center', md: 'left' }} variant="body1">
          {displayBN(new BigNumber(props.proposal.scores[0]).div(props.totalStalk).multipliedBy(100))}% of Stalk voted For
        </Typography>
      </Stack>
    )}
  </Stack>
  );

export default ProposalStats;
