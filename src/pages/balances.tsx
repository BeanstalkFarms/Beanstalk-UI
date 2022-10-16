import React from 'react';
import { Container, Stack } from '@mui/material';

import { XXLWidth } from '~/components/App/muiTheme';
import SiloRewards from '~/components/Balances/SiloRewards';

import { FC } from '~/types';

import ValuedTokenBalances from '~/components/Balances/ValuedTokenBalances';
import BeanstalkTokenBalances from '~/components/Balances/BeanstalkTokenBalances';
import QuickHarvest from '~/components/Balances/Actions/QuickHarvest';
import QuickRinse from '~/components/Balances/Actions/QuickRinse';
import FarmerSiloBalances from '~/components/Balances/FarmerSiloBalances';

const BalancesPage: FC<{}> = () => (
  <Container sx={{ maxWidth: `${XXLWidth}px !important`, width: '100%' }}>
    <Stack spacing={2} width="100%">
      <BeanstalkTokenBalances />
      <Stack direction={{ xs: 'column', lg: 'row' }} gap={2}>
        <Stack width="100%" gap={2}>
          {/* <UserBalancesCharts /> */}
          <FarmerSiloBalances />
          <ValuedTokenBalances />
        </Stack>
        {/* Actions */}
        <Stack
          width="100%"
          maxWidth={{ xs: '100%', lg: '360px' }}
          sx={{ flexShrink: 0 }}
          spacing={1}
        >
          <QuickHarvest />
          <QuickRinse />
          <SiloRewards />
        </Stack>
      </Stack>

    </Stack>
  </Container>
);  

export default BalancesPage;
