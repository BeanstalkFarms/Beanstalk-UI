import React from 'react';
import { Link, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { getDateMessage, Proposal } from '~/util/Governance';
import { displayBN } from '~/util';
import Dot from '~/components/Common/Dot';
import { ZERO_BN } from '~/constants';
import Row from '~/components/Common/Row';

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
  <Stack
    alignItems={{ xs: 'start', md: 'center' }}
    justifyContent="space-between"
    width="100%"
    direction={{ xs: 'column', md: 'row' }}
    gap={{ xs: 0.5, md: 0 }}
  >
    <Row gap={2}>
      <Row gap={0.5}>
        <Dot color={proposal.state === 'active' ? 'primary.main' : 'gray'} />
        <Typography variant="body1">
          {proposal.state.charAt(0).toUpperCase() + proposal.state.slice(1)}
        </Typography>
      </Row>
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
    </Row>
    {/* if there is time remaining... */}
    {(differenceInTime && differenceInTime > 0 && totalStalk) && (
      <Row gap={0.5}>
        {proposal.space.id === 'wearebeansprout.eth' ? (
          <Typography textAlign={{ xs: 'center', md: 'left' }} variant="body1">
            {displayBN(new BigNumber(proposal.scores_total ? proposal.scores_total : ZERO_BN).div(totalStalk).multipliedBy(100))}% of Stalk voted
          </Typography>
        ) : (
          <Typography textAlign={{ xs: 'center', md: 'left' }} variant="body1">
            {displayBN(new BigNumber(proposal.scores[0] ? proposal.scores[0] : ZERO_BN).div(totalStalk).multipliedBy(100))}% of Stalk voted For
          </Typography>
        )}
      </Row>
    )}  
  </Stack>
);

export default ProposalStats;
