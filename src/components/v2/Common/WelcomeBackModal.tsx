import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Dialog, Grid, Stack, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

const WelcomeBackModal: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(true);

  // only show "welcome back" modal on first visit
  useEffect(() => {
    const visited = localStorage['already-visited'];
    if (visited) {
      setModalOpen(false);
    } else {
      localStorage['already-visited'] = true;
      setModalOpen(true);
    }
  }, [setModalOpen]);

  return (
    <Dialog onClose={() => setModalOpen(false)} open={modalOpen} fullWidth>
      <Card sx={{ p: 2 }}>
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h2">Welcome back to Beanstalk! 👋 🌱 ☀️</Typography>
              <ClearIcon sx={{ cursor: 'pointer', color: '#bbbcd1' }} onClick={() => setModalOpen(false)} />
            </Stack>
          </Grid>
          <Grid item>
            <Typography variant="body1">
              We’re excited to Replant Beanstalk. We’ve taken the liberty to apply some new styling to the site & we
              hope you enjoy it! If you have any questions or feedback, please let us know in the <strong>#ui-feedback</strong> channel in Discord.
            </Typography>
          </Grid>
          <Grid item>
            <Box display="flex" justifyContent="flex-end">
              <Button onClick={() => setModalOpen(false)}>
                Continue
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Dialog>
  );
};

export default WelcomeBackModal;
