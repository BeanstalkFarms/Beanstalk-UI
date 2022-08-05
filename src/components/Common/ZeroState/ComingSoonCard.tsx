import React from 'react';
import forecast from '~/img/beanstalk/forecast-banner.svg';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Card, Stack, Typography } from '@mui/material';

const ComingSoonCard : React.FC<{ title: string }> = ({ title }) => (
  <Card sx={{ px: 4, py: 6 }}>
    <Stack direction="column" alignItems="center" justifyContent="center" gap={4}>
      <img src={forecast} alt="Barn" style={{ maxWidth: 400 }} />
      <Typography variant="h1">The {title} page is coming soon</Typography>
      <Stack direction="column" gap={2}>
        <Button
          component={RouterLink}
          to="/"
          color="primary"
          variant="outlined"
          size="large"
          sx={{ px: 4 }}
          >
          Support the Barn Raise
        </Button>
      </Stack>
    </Stack>
  </Card>
);

export default ComingSoonCard;
