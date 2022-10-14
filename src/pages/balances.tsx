import React from 'react';
import { Container, Stack } from '@mui/material';

import { XXLWidth } from '~/components/App/muiTheme';
import UserBalancesCharts from '~/components/Balances/UserBalancesCharts';
import SiloRewards from '~/components/Balances/SiloRewards';

import { FC } from '~/types';

import ValuedTokenBalances from '~/components/Balances/ValuedTokenBalances';
import BeanstalkTokenBalances from '~/components/Balances/BeanstalkTokenBalances';

const BalancesPage: FC<{}> = () => (
  <Container sx={{ maxWidth: `${XXLWidth}px !important`, width: '100%' }}>
    <Stack spacing={2}>
      <BeanstalkTokenBalances />

      <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} width="100%">
        <UserBalancesCharts />
        <Stack
          width="100%"
          maxWidth={{ xs: '100%', lg: '360px' }}
          sx={{ flexShrink: 0 }}
        >
          <SiloRewards />
        </Stack>
      </Stack>

      <ValuedTokenBalances />
    </Stack>
  </Container>
);

export default BalancesPage;
