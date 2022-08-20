import React from 'react';
import { Link, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { getDateMessage, Proposal } from '~/util/Governance';
import { displayBN } from '~/util';
import Dot from '~/components/Common/Dot';

const ProposalStats: React.FC<{
  proposal: Proposal;
  differenceInTime?: number;
  totalStalk?: BigNumber;
  showLink?: boolean;
}> = ({
  proposal,
  differenceInTime,
  totalStalk,
  showLink = false,
}) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
    <Stack direction="row" alignItems="center" gap={2}>
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Dot color={proposal.state === 'active' ? 'primary.main' : 'gray'} />
        <Typography variant="body1">
          {proposal.state.charAt(0).toUpperCase() + proposal.state.slice(1)}
        </Typography>
      </Stack>
      <Typography variant="body1">
        {getDateMessage(proposal.end)}
      </Typography>
      {showLink && (
        <Link
          href={`https://snapshot.org/#/${proposal.space.id}/proposal/${proposal.id}`}
          target="_blank"
          rel="noreferrer"
          underline="hover"
            >
          View on Snapshot
        </Link>
      )}
    </Stack>
    {/* if there is time remaining... */}
    {(differenceInTime && differenceInTime > 0 && totalStalk) && (
      <Stack direction="row" alignItems="center" gap={0.5} display={{ xs: 'none', md: 'block' }}>
        {proposal.space.id === 'wearebeansprout.eth' ? (
          <Typography textAlign={{ xs: 'center', md: 'left' }} variant="body1">
            {displayBN(new BigNumber(proposal.scores_total).div(totalStalk).multipliedBy(100))}% of Stalk voted
          </Typography>
        ) : (
          <Typography textAlign={{ xs: 'center', md: 'left' }} variant="body1">
            {displayBN(new BigNumber(proposal.scores[0]).div(totalStalk).multipliedBy(100))}% of Stalk voted For
          </Typography>
        )}
      </Stack>
    )}  
  </Stack>
);

export default ProposalStats;
