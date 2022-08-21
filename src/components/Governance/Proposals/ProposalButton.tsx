import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { Link as ReactRouterLink } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import BigNumber from 'bignumber.js';
import { AppState } from '~/state';
import { useVotesQuery } from '~/generated/graphql';
import useAccount from '~/hooks/ledger/useAccount';
import ProposalStats from '~/components/Governance/Proposals/ProposalStats';
import { BeanstalkPalette, IconSize } from '~/components/App/muiTheme';
import { Proposal } from '~/util/Governance';

const ProposalButton: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  /// State
  const account = useAccount();
  const totalStalk = useSelector<AppState, BigNumber>((state) => state._beanstalk.silo.stalk.total);

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

  /// Time
  const today = new Date();
  const endDate = new Date(proposal.end * 1000);
  const differenceInTime = endDate.getTime() - today.getTime();
  
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
        borderColor: '#c7ddf0',
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
          {/* Sshow if user has voted */}
          {(account && voteData?.votes?.length) ? (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <CheckIcon sx={{ color: BeanstalkPalette.logoGreen, width: IconSize.small }} />
              <Typography variant="body1">Voted</Typography>
            </Stack>
          ) : null}
        </Stack>
        {/* Bottom row */}
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between">
          <ProposalStats
            totalStalk={totalStalk}
            differenceInTime={differenceInTime}
            proposal={proposal}
          />
        </Stack>
      </Stack>
    </Button>
  );
};

export default ProposalButton;
