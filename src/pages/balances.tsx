import React from 'react';
import { Card, Container, Grid, Stack } from '@mui/material';
import UserBalancesCard from '~/components/Balances/Cards/UserBalancesCard';
import { XXLWidth } from '~/components/App/muiTheme';
import UserBalancesCharts from '~/components/Balances/UserBalancesCharts';
import RewardsModule from '~/components/Balances/RewardsModule';

import { FC } from '~/types';

const BalancesPage: FC<{}> = () => (
  <Container sx={{ maxWidth: `${XXLWidth}px !important`, width: '100%' }}>
    <Stack gap={2}>
      <Card sx={{ p: 2 }}>
        <UserBalancesCard />
      </Card>
      <Grid container direction="row" spacing={2}>
        <Grid item xs={12} md={8}>
          <UserBalancesCharts />
        </Grid>
        <Grid item xs={12} md={4}>
          <RewardsModule />
        </Grid>
      </Grid>
    </Stack>
  </Container>
);

export default BalancesPage;
