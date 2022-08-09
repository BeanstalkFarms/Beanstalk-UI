import React from 'react';
import {
  Card,
  Container,
  Stack,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

import PageHeader from '~/components/Common/PageHeader';
import LiquidityOverTime from '~/components/Forecast/LiquidityOverTime';
import PodRate from '~/components/Analytics/Field/PodRate';
import Price from '~/components/Analytics/Bean/Price';
import { AppState } from '~/state';
import LiquidityByState from '~/components/Forecast/LiquidityByState';

const ForecastPage: React.FC = () => {
  // Data
  const balances = useSelector<AppState, AppState['_beanstalk']['silo']['balances']>((state) => state._beanstalk.silo.balances);

  // Theme
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const content = (
    <>
      <Stack direction={isMobile ? 'column' : 'row'} gap={2}>
        <Card sx={{ flex: 1, pt: 2 }}>
          <Price />
        </Card>
        <Card sx={{ flex: 1, pt: 2 }}>
          <PodRate />
        </Card>
      </Stack>
      <LiquidityOverTime
        balances={balances}
      />
      <LiquidityByState />
    </>
  );

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="Forecast"
          description="View conditions on the Farm"
        />
        {content}
      </Stack>
    </Container>
  );
};

export default ForecastPage;
