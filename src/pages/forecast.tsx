import React from 'react';
import {
  Button,
  Card,
  Container, 
  Stack,
  useMediaQuery
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { ANALYTICS_LINK, SupportedChainId } from 'constants/index';
import PageHeader from 'components/Common/PageHeader';
import LiquidityOverTime from 'components/Forecast/LiquidityOverTime';
import useChainId from 'hooks/useChain';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import PodRate from 'components/Analytics/Field/PodRate';
import TWAP from 'components/Analytics/Bean/TWAP';
import LiquidityByState from '../components/Forecast/LiquidityByState';

const ForecastPage: React.FC = () => {
  const chainId = useChainId();

  // Data
  const balances = useSelector<AppState, AppState['_beanstalk']['silo']['balances']>((state) => state._beanstalk.silo.balances);
  
  // Theme
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  let content;
  if (chainId === SupportedChainId.MAINNET) {
    content = (
      <ComingSoonCard title="Forecast" />
    );
  } else {
    content = (
      <>
        <Stack direction={isMobile ? 'column' : 'row'} gap={2}>
          <Card sx={{ flex: 1 }}>
            <TWAP />
          </Card>
          <Card sx={{ flex: 1 }}>
            <PodRate />
          </Card>
        </Stack>
        <LiquidityOverTime balances={balances} />
        <LiquidityByState />
      </>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="Forecast"
          description="View conditions on the Farm"
          control={(
            <Button
              href={ANALYTICS_LINK}
              target="_blank"
              rel="noreferrer"
              color="light"
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ transform: 'rotate(-45deg)' }} />}
            >
              Pre-exploit Analytics
            </Button>
          )}
        />
        {content}
      </Stack>
    </Container>
  );
};

export default ForecastPage;
