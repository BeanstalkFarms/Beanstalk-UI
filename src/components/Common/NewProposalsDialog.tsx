import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { Link } from 'react-router-dom';
import { StyledDialog, StyledDialogActions, StyledDialogContent, StyledDialogTitle } from './Dialog';
import { AppState } from '~/state';
import { ActiveProposal } from '~/state/beanstalk/governance';
import useAccount from '~/hooks/ledger/useAccount';
import { displayBN } from '~/util';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import TokenIcon from '~/components/Common/TokenIcon';
import { STALK } from '~/constants/tokens';

/**
 *
 */
const NewProposalsDialog: React.FC = () => {
  // Hooks
  const account = useAccount();

  // Local state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [hasNotSeen, setHasNotSeen] = useState<ActiveProposal[]>([]);

  // State
  const activeProposals = useSelector<AppState, Array<ActiveProposal>>((state) => state._beanstalk.governance.activeProposals);
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);

  // Handlers
  const handleClose = useCallback(() => setModalOpen(false), []);

  // Helpers
  const createProposalString = () => {
    // ex: BIP-1 is open for voting
    if (hasNotSeen.length === 1) {
      return `${hasNotSeen[0]?.title?.split(':')[0].bold()} is open for voting.`;
    }
    // ex: BIP-1 and BOP-2 are open for voting
    if (hasNotSeen.length === 2) {
      return `${hasNotSeen[0]?.title?.split(':')[0].bold()} and ${hasNotSeen[0]?.title?.split(':')[1].bold()} are open for voting.`;
    }
    // ex: BIP-1, BOP-2, and BFCP-A-2 are open for voting
    const titles: (string | undefined)[] = hasNotSeen.map((p) => p.title);
    return titles.reduce((prev, curr, i) => {
      if (i + 1 === titles.length) {
        return prev?.concat(`and ${curr?.split(':')[0].bold()} are open for voting.`);
      }
      return prev?.concat(`${curr?.split(':')[0].bold()}, `);
    }, '');
  };

  const proposalString = createProposalString();

  useEffect(() => {
    if (account) {
      activeProposals.forEach((p) => {
        if (p.id) {
          const seenProposal = localStorage.getItem(p.id);
          if (!seenProposal) {
            localStorage.setItem(p.id, 'true');
            setHasNotSeen(hasNotSeen.concat(p));
            setModalOpen(true);
          }
        }
      });
    }
  }, [account, activeProposals, hasNotSeen, setModalOpen]);

  if (proposalString === undefined) {
    return null;
  }

  return (
    <StyledDialog
      onClose={handleClose}
      open={modalOpen}
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: '431px'
        }
      }}
    >
      <StyledDialogTitle onClose={handleClose}>
        <Typography variant="h4">Use Stalk to vote on new governance proposals</Typography>
      </StyledDialogTitle>
      <StyledDialogContent sx={{ px: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="center" height={115}>
          <Stack>
            <Typography variant="bodyLarge" textAlign="center"><TokenIcon
              token={STALK} />{displayBN(farmerSilo.stalk.active)}
            </Typography>
            <Typography
              variant="body1"
              color="gray"
              textAlign="center">{displayBN((farmerSilo.stalk.active.div(beanstalkSilo.stalk.total)).multipliedBy(new BigNumber(100)))}%
              Ownership
            </Typography>
          </Stack>
        </Box>
        <Typography textAlign="center">
          <Typography
            display="inline"
            dangerouslySetInnerHTML={{
              __html: proposalString
            }}
          />
          &nbsp;The voting periods will end DD/MM at XX:XX UTC.
        </Typography>

      </StyledDialogContent>
      <StyledDialogActions sx={{ gap: 1, p: 1 }}>
        <Button
          onClick={handleClose}
          fullWidth
          color="light"
          sx={{
            border: 1,
            color: BeanstalkPalette.lightGrey,
            borderColor: BeanstalkPalette.lightestGrey,
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          <Typography variant="body1">Not now</Typography>
        </Button>
        <Button onClick={handleClose} component={Link} to="/governance" fullWidth>
          Continue
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default NewProposalsDialog;
