import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { Link as ReactRouterLink } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import { useProposalQuorumQuery, useVotesQuery } from '~/generated/graphql';
import useAccount from '~/hooks/ledger/useAccount';
import ProposalStats from '~/components/Governance/Proposals/ProposalStats';
import { BeanstalkPalette, IconSize } from '~/components/App/muiTheme';
import { getProposalTag, getProposalType, Proposal } from '~/util/Governance';
import Row from '~/components/Common/Row';
import { toTokenUnitsBN } from '~/util';
import { STALK } from '~/constants/tokens';
import { getQuorum } from '~/lib/Beanstalk/Governance';

const ProposalButton: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  /// State
  const account = useAccount();

  /// Query Votes
  const { data: voteData } = useVotesQuery({
    variables: {
      proposal_id: proposal.id.toLowerCase(),
      voter_address: account || '',
    },
    fetchPolicy: 'cache-and-network',
    skip: !account, // only send query when wallet connected
    context: { subgraph: 'snapshot' }
  });

  /// Query total stalk at the season right before this proposal
  const { loading: loading2, error: error2, data: data2 } = useProposalQuorumQuery({
    variables: { created_at: proposal?.start },
    fetchPolicy: 'network-only',
    skip: !proposal?.start
  });

  /// Time
  const today = new Date();
  const endDate = new Date(proposal.end * 1000);
  const differenceInTime = endDate.getTime() - today.getTime();
  const totalStalk = toTokenUnitsBN(data2?.siloHourlySnapshots[0].totalStalk || 0, STALK.decimals);
  const tag = getProposalTag(proposal.title);
  const type = getProposalType(tag);
  const quorum = getQuorum(type, totalStalk);
  
  return (
    <Button
      variant="outlined"
      color="secondary"
      component={ReactRouterLink}
      to={`/governance/${proposal.id}`}
      sx={{
        p: 2,
        height: 'auto',
        color: '#000000',
        borderColor: BeanstalkPalette.lightestGrey,
      }}
    >
      <Stack gap={1} width="100%">
        {/* Top row */}
        <Stack direction={{ xs: 'column-reverse', md: 'row' }} justifyContent="space-between">
          <Typography display={{ xs: 'none', md: 'block' }} textAlign="left" variant="bodyLarge">
            {proposal.title}
          </Typography>
          <Typography display={{ xs: 'block', md: 'none' }} textAlign="left" variant="bodyLarge" sx={{ fontSize: { xs: '20px', md: 'inherit' }, lineHeight: '24px' }}>
            {proposal.title.substring(0, 55)}{proposal.title.length > 55 ? '...' : null}
          </Typography>
          {/* Show if user has voted */}
          {(account && voteData?.votes?.length) ? (
            <Row gap={0.5}>
              <CheckIcon sx={{ color: BeanstalkPalette.logoGreen, width: IconSize.small }} />
              <Typography variant="body1">Voted</Typography>
            </Row>
          ) : null}
        </Stack>
        {/* Bottom row */}
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between">
          <ProposalStats
            proposal={proposal}
            totalStalk={totalStalk.gt(0) ? totalStalk : undefined}
            quorum={quorum}
            differenceInTime={differenceInTime}
          />
        </Stack>
      </Stack>
    </Button>
  );
};

export default ProposalButton;
