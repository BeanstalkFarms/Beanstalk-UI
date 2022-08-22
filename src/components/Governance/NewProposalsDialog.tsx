import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { StyledDialog, StyledDialogActions, StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import { AppState } from '~/state';
import { ActiveProposal } from '~/state/beanstalk/governance';
import { displayBN } from '~/util';
import { IconSize } from '~/components/App/muiTheme';
import TokenIcon from '~/components/Common/TokenIcon';
import { STALK } from '~/constants/tokens';
import useAppFlag from '~/hooks/useAppFlag';
import useToggle from '~/hooks/display/useToggle';
import { getDateCountdown } from '~/util/Time';
import { getProposalTag } from '~/util/Governance';

// const getLastSeen = (account: string) => {
//   try {
//     return parseInt(
//       localStorage.getItem(`beanstalk.account.${account}.last_gov_prompt`) || '0',
//       10
//     );
//   } catch (e) {
//     return 0;
//   }
// };

/**
 *
 */
const NewProposalsDialog: React.FC = () => {
  /// Local state
  const [modalOpen, showModal, hideModal] = useToggle();
  const [unseenProposals, setUnseenProposals] = useState<ActiveProposal[]>([]);
  const [getLastSeen, setLastSeen] = useAppFlag<number>('last_gov_prompt', 'int', 0);

  /// State
  const activeProposals = useSelector<AppState, ActiveProposal[]>((state) => state._beanstalk.governance.activeProposals);
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);

  const dismiss = useCallback(() => {
    setLastSeen(Math.floor(new Date().getTime() / 1000));
    hideModal();
  }, [hideModal, setLastSeen]);

  useEffect(() => {
    const lastSeen = getLastSeen();
    const _unseenProposals = activeProposals.filter(
      (p) => p.start > lastSeen,
    );
    if (_unseenProposals.length > 0) {
      setUnseenProposals(_unseenProposals);
      showModal(true);
    }
  }, [activeProposals, getLastSeen, setLastSeen, showModal]);

  const destination = unseenProposals.length === 1
    ? `/governance/${unseenProposals[0].id}`
    : '/governance';
  const buttonText = unseenProposals.length === 1
    ? `View ${getProposalTag(unseenProposals[0].title) || 'proposal'}`
    : 'View proposals';

  return (
    <StyledDialog
      onClose={dismiss}
      open={modalOpen}
      fullWidth
    >
      <StyledDialogTitle onClose={dismiss}>
        New governance proposals
      </StyledDialogTitle>
      <StyledDialogContent sx={{ px: 2, pt: 1, pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="center" py={3}>
          <Stack direction="row" alignItems="center" gap={0.3}>
            <TokenIcon token={STALK} style={{ height: IconSize.small }} />
            <Typography variant="bodyLarge" textAlign="center">
              {displayBN(farmerSilo.stalk.active)} STALK
            </Typography>
          </Stack>
        </Box>
        <Stack gap={0.5}>
          {unseenProposals.map((p) => (
            <Stack key={p.id} alignItems="flex-start" direction="row" justifyContent="space-between">
              <Typography>{p.title}</Typography>
              <Typography variant="body2" whiteSpace="nowrap" fontWeight="bold">
                Ends {getDateCountdown(p.end * 1000)[0]}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </StyledDialogContent>
      <StyledDialogActions sx={{ gap: 1 }}>
        <Button
          onClick={dismiss}
          fullWidth
          color="dark"
          variant="outlined"
        >
          <Typography variant="body1">Not now</Typography>
        </Button>
        <Button onClick={dismiss} component={Link} to={destination} fullWidth>
          {buttonText}
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default NewProposalsDialog;