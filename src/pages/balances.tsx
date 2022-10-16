import React from 'react';
import { Box, Card, Container, Stack } from '@mui/material';
import { XXLWidth } from '~/components/App/muiTheme';
import { FC } from '~/types';
import ValuedTokenBalances from '~/components/Balances/ValuedTokenBalances';
import BeanstalkTokenBalances from '~/components/Balances/BeanstalkTokenBalances';
import FarmerSiloBalances from '~/components/Balances/FarmerSiloBalances';
import BalanceActions from '~/components/Balances/Actions';

const BalancesPage: FC<{}> = () => (
  <Container sx={{ maxWidth: `${XXLWidth}px !important`, width: '100%' }}>
    <Stack gap={2}>
      {/* Beanstalk Tokens e.g. Stalk, Seeds, Pods, & Sprouts Balances */}
      <Card sx={{ p: 2 }}>
        <BeanstalkTokenBalances />
      </Card>
      <Stack direction="row" gap={2}>
        <Stack sx={{ minWidth: 0 }} width="100%" gap={2}>
          {/* Deposit Balances */}
          <Card sx={{ p: 2 }}>
            <FarmerSiloBalances />
          </Card>
          {/* Actions: Quick Harvest, Quick Rinse, & Silo Rewards */}
          <Box display={{ xs: 'block', lg: 'none' }}>
            <BalanceActions />
          </Box>
          {/* Farm & Circulating Balances */}
          <ValuedTokenBalances />
        </Stack>
        {/* Actions: Quick Harvest, Quick Rinse, & Silo Rewards */}
        <Box display={{ xs: 'none', lg: 'block' }} sx={{ position: 'relative' }}>
          <BalanceActions />
        </Box>
      </Stack>
    </Stack>
  </Container>
);

export default BalancesPage;
