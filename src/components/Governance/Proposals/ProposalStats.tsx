import React from 'react';
import { Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { getDateMessage, Proposal } from '~/util/Governance';
import { displayBN } from '~/util';
import Dot from '~/components/Common/Dot';

const ProposalStats: React.FC<{ proposal: Proposal, differenceInTime?: number, totalStalk?: BigNumber }> = (props) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
    <Stack direction="row" alignItems="center" gap={2}>
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Dot color={props.proposal.state === 'active' ? 'primary.main' : 'gray'} />
        <Typography variant="body1">
          {props.proposal.state.charAt(0).toUpperCase() + props.proposal.state.slice(1)}
        </Typography>
      </Stack>
      <Typography variant="body1">
        {getDateMessage(props.proposal.end)}
      </Typography>
    </Stack>
    {/* if there is time remaining... */}
    {(props.differenceInTime && props.differenceInTime > 0 && props.totalStalk) && (
      <Stack direction="row" alignItems="center" gap={0.5} display={{ xs: 'none', md: 'block' }}>
        {props.proposal.space.id === 'wearebeansprout.eth' ? (
          <Typography textAlign={{ xs: 'center', md: 'left' }} variant="body1">
            {displayBN(new BigNumber(props.proposal.scores_total).div(props.totalStalk).multipliedBy(100))}% of Stalk voted
          </Typography>
        ) : (
          <Typography textAlign={{ xs: 'center', md: 'left' }} variant="body1">
            {displayBN(new BigNumber(props.proposal.scores[0]).div(props.totalStalk).multipliedBy(100))}% of Stalk voted For
          </Typography>
        )}
      </Stack>
    )}  
  </Stack>
);

export default ProposalStats;
