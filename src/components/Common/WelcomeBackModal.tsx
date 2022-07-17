import React, { useCallback, useEffect, useState } from 'react';
import { Button, Link, Typography } from '@mui/material';
import {
  StyledDialog,
  StyledDialogActions,
  StyledDialogContent,
  StyledDialogTitle,
} from './Dialog';

const STORAGE_KEY = 'beanstalk.welcome-back.seen';

const WelcomeBackModal: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleClose = useCallback(() => setModalOpen(false), []);

  // only show "welcome back" modal on first visit
  useEffect(() => {
    const visited = localStorage.getItem(STORAGE_KEY);
    if (!visited) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setModalOpen(true);
    }
  }, [setModalOpen]);

  return (
    <StyledDialog onClose={handleClose} open={modalOpen} fullWidth>
      <StyledDialogTitle>🌱 Welcome back to Beanstalk!</StyledDialogTitle>
      <StyledDialogContent>
        <Typography variant="body1">
          We&apos;ve updated the Beanstalk UI with a fresh design. Most prior
          balances are now available — more will be released between now and
          Replant.
        </Typography>
        <br />
        <Typography variant="body1">
          <Link
            href="https://discord.gg/beanstalk"
            target="_blank"
            rel="noreferrer"
          >
            Join Discord
          </Link>{' '}
          for announcements about Beanstalk, the Barn Raise, and more.
        </Typography>
        {/* <Grid container direction="column" spacing={1}>
          <Grid item>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h2"></Typography>
              <ClearIcon sx={{ cursor: 'pointer', color: '#bbbcd1' }} onClick={() => setModalOpen(false)} />
            </Stack>
          </Grid>
        </Grid> */}
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={handleClose} fullWidth>
          Continue
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default WelcomeBackModal;
