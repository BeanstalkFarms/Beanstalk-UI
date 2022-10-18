import React from 'react';
import { Box, Card, Container, Stack, Typography } from '@mui/material';
import { XXLWidth } from '~/components/App/muiTheme';
import { FC } from '~/types';
import ValuedTokenBalances from '~/components/Balances/ValuedTokenBalances';
import FarmerSiloBalances from '~/components/Balances/FarmerSiloBalances';
import BalanceActions from '~/components/Balances/Actions';
import BeanstalkTokenBalancesRow from '~/components/Balances/BalancesRow';
import UserBalancesCharts from '~/components/Balances/UserBalancesCharts';

const BalancesPage: FC<{}> = () => (
  <Container sx={{ maxWidth: `${XXLWidth}px !important`, width: '100%' }}>
    <Stack gap={2}>
      <Stack width={{ xs: '100%', lg: 'calc(100% - 380px)' }} gap={0.5}>
        <Typography variant="h1">Balances</Typography>
        <BeanstalkTokenBalancesRow />
      </Stack>
      <Stack gap={2} direction="row">
        <Stack sx={{ minWidth: 0 }} width="100%" gap={2}>
          <Card sx={{ pt: 2, pb: 0 }}>
            <UserBalancesCharts />
          </Card>
          {/* Deposit Balances */}
          <Card>
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
        <Box
          display={{ xs: 'none', lg: 'block' }}
          sx={{ position: 'relative' }}
        >
          <BalanceActions />
        </Box>
      </Stack>
    </Stack>
  </Container>
);

export default BalancesPage;
