import React from 'react';
import { Link, Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { getDateMessage, Proposal } from '~/util/Governance';
import { displayBN, displayFullBN } from '~/util';
import Dot from '~/components/Common/Dot';
import { ZERO_BN } from '~/constants';
import Row from '~/components/Common/Row';
import StatHorizontal from '~/components/Common/StatHorizontal';

const ProposalStats: React.FC<{
  proposal: Proposal;
  totalStalk?: BigNumber;
  quorum?: BigNumber;
  differenceInTime?: number;
  showLink?: boolean;
}> = ({
  proposal,
  totalStalk,
  quorum,
  differenceInTime,
  showLink = false,
}) => {
  const score = (
    proposal.space.id === 'wearebeansprout.eth'
      ? new BigNumber(proposal.scores_total || ZERO_BN)
      : new BigNumber(proposal.scores[0] || ZERO_BN)
  );
  return (
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
        <Tooltip title={new Date(proposal.end * 1000).toLocaleString()}>
          <Typography variant="body1">
            {getDateMessage(proposal.end)}
          </Typography>
        </Tooltip>
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
          <Tooltip
            title={
              <div>
                <StatHorizontal label="Stalk voted For">
                  {displayFullBN(new BigNumber(proposal.scores[0]) || ZERO_BN, 2)}
                </StatHorizontal>
                {quorum && (
                  <StatHorizontal label="Stalk for Quorum">
                    {displayFullBN(quorum, 2)}
                  </StatHorizontal>
                )}
                <StatHorizontal label="Eligible Stalk">
                  {displayFullBN(totalStalk, 2)}
                </StatHorizontal>
                <StatHorizontal label="Snapshot Block">
                  {proposal.snapshot}
                </StatHorizontal>
              </div>
            }
          >
            <Typography textAlign={{ xs: 'center', md: 'left' }} variant="body1">
              {displayBN(score.div(totalStalk).multipliedBy(100))}% of Stalk voted For
            </Typography>
          </Tooltip>
        </Row>
      )}  
    </Stack>
  );
};

export default ProposalStats;
