import React from 'react';
import { Card, Container, Stack, Typography } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';

const BarnRaisePage : React.FC = () => {
  return (
    <Container maxWidth="md">
      <Stack gap={2}>
        <PageHeader
          title="The Barn Raise"
          purpose="Rebuilding Beanstalk"
          description="Earn yield through purchasing & activating Fertilizer, the Barn Raise token"
        />
        <Card>
          <Typography>Remaining Fertilizer</Typography>
          <Typography>Available Unused Fertilizer</Typography>
          <Typography></Typography>
          <Typography>Current Humidity (Interest Rate)</Typography>
          <Typography></Typography>
        </Card>
      </Stack>
    </Container>
  );
};

export default BarnRaisePage;
