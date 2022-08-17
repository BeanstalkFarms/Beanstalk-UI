import React, { useMemo } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { Link as ReactRouterLink } from 'react-router-dom';
import { displayBN } from '~/util';
import { BeanstalkPalette, IconSize } from '~/components/App/muiTheme';
import { AppState } from '~/state';
import useGovernanceQuery from '~/hooks/useGovernanceQuery';
import { VotesDocument } from '~/generated/graphql';
import useAccount from '~/hooks/ledger/useAccount';
import ProposalStats from '~/components/Governance/Proposals/ProposalStats';

const ProposalButton: React.FC<{ proposal: any }> = (props) => {
  /// Setup
  const account = useAccount();
  const p = props.proposal;

  /// State
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  const totalStalk = beanstalkSilo.stalk.total;

  /// Query Votes
  const queryConfig = useMemo(() => ({
    variables: {
      proposal_id: p.id.toString().toLowerCase(),
      voter_address: account ? account.toLowerCase() : '',
    }
  }), [p, account]);
  const { data: voteData } = useGovernanceQuery(VotesDocument, queryConfig);

  return (
    <Button
      variant="outlined"
      color="secondary"
      component={ReactRouterLink}
      to={`/proposal/${p.id}`}
      sx={{
        p: 2,
        height: 'auto', // FIXME
        // display: 'block',
        color: '#000000',
        borderColor: '#c7ddf0',
      }}
    >
      <Stack gap={1} width="100%">
        {/* top row */}
        {/* middle row */}
        <Stack gap={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography textAlign="left" variant="bodyLarge">{p.title}</Typography>
            {(account && voteData?.votes?.length > 0) && (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <CheckIcon sx={{ color: BeanstalkPalette.logoGreen, width: IconSize.small }} />
                <Typography variant="body1">Voted</Typography>
              </Stack>
            )}
          </Stack>
          <Typography textAlign="left" color="gray" variant="body1">{p.title}</Typography>
        </Stack>
        {/* bottom row */}
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between">
          <ProposalStats proposal={p} />
          {/* show if user has voted */}
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography variant="body1">{displayBN(new BigNumber(p.scores[0]).div(totalStalk).multipliedBy(100))}% of
              Stalk voted For
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Button>
  );
};

export default ProposalButton;
