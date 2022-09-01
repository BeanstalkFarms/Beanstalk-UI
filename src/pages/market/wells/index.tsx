import React from 'react';
import {
  Card,
  Container, Grid,
  Stack, Typography
} from '@mui/material';

import PageHeader from '~/components/Common/PageHeader';
import Price from '~/components/Analytics/Bean/Price';
import Wells from '~/components/Market/Wells/Wells';

const WellHomePage: React.FC = () => (
  <Container maxWidth="lg">
    <Stack gap={2}>
      <PageHeader
        title="The Decentralized Exchange"
        description="Explore Liquidity Wells in the zero-fee DEX."
        />
      <Grid container direction={{ md: 'row', xs: 'column' }} spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ flex: 1, pt: 2 }}>
            <Price />
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography>Wells are here!</Typography>
          </Card>
        </Grid>
      </Grid>
      <Wells />
    </Stack>
  </Container>
  );

export default WellHomePage;
