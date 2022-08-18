import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { Link as ReactRouterLink } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import { AppState } from '~/state';
import { useVotesQuery } from '~/generated/graphql';
import useAccount from '~/hooks/ledger/useAccount';
import ProposalStats from '~/components/Governance/Proposals/ProposalStats';

import { BeanstalkPalette, IconSize } from '~/components/App/muiTheme';

const ProposalButton: React.FC<{ proposal: any }> = (props) => {
  /// Setup
  const account = useAccount();
  const p = props.proposal;

  /// State
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  const totalStalk = beanstalkSilo.stalk.total;

  /// Query Votes
  const { data: voteData } = useVotesQuery({
    variables: {
      proposal_id: p.id.toString().toLowerCase(),
      voter_address: account ? account.toLowerCase() : '',
    },
    context: { subgraph: 'snapshot' }
  });

  // Time
  const today = new Date();
  const endDate = new Date(p.end * 1000);
  const differenceInTime = endDate.getTime() - today.getTime();
  
  return (
    <Button
      variant="outlined"
      color="secondary"
      component={ReactRouterLink}
      to={`/governance/${p.id}`}
      sx={{
        p: 2,
        height: 'auto',
        color: '#000000',
        borderColor: '#c7ddf0',
      }}
    >
      <Stack gap={1} width="100%">
        {/* top row */}
        <Stack direction={{ xs: 'column-reverse', md: 'row' }} justifyContent="space-between">
          <Typography display={{ xs: 'none', md: 'block' }} textAlign="left" variant="bodyLarge">{p.title}</Typography>
          <Typography display={{ xs: 'block', md: 'none' }} textAlign="left" variant="bodyLarge" sx={{ fontSize: { xs: '20px', md: 'inherit' }, lineHeight: '24px' }}>{p.title.toString().substring(0, 55)}{p.title.length > 55 ? '...' : null}</Typography>
          {/* show if user has voted */}
          {(account && voteData?.votes?.length) ? (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <CheckIcon sx={{ color: BeanstalkPalette.logoGreen, width: IconSize.small }} />
              <Typography variant="body1">Voted</Typography>
            </Stack>
          ) : null}
        </Stack>
        {/* bottom row */}
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between">
          <ProposalStats totalStalk={totalStalk} differenceInTime={differenceInTime} proposal={p} />
        </Stack>
      </Stack>
    </Button>
  );
};

export default ProposalButton;
