import React from 'react';
import { Container, Stack } from '@mui/material';
import UserBalancesCard from '~/components/Balances/Cards/UserBalancesCard';
import { XXLWidth } from '~/components/App/muiTheme';
import UserBalancesCharts from '~/components/Balances/UserBalancesCharts';
import RewardsModule from '~/components/Balances/RewardsModule';

import { FC } from '~/types';

import TokenBalancesModule from '~/components/Balances/TokenBalancesModule';

const BalancesPage: FC<{}> = () => (
  <Container sx={{ maxWidth: `${XXLWidth}px !important`, width: '100%' }}>
    <Stack spacing={2}>
      <UserBalancesCard />

      <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} width="100%">
        <UserBalancesCharts />
        <Stack
          width="100%"
          maxWidth={{ xs: '100%', lg: '360px' }}
          sx={{ flexShrink: 0 }}
        >
          <RewardsModule />
        </Stack>
      </Stack>

      <TokenBalancesModule />
    </Stack>
  </Container>
);

export default BalancesPage;
