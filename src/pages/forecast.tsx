import React from 'react';
import { Box, Button, Card, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageHeader from 'components/Common/PageHeader';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import duneIcon from 'img/dune-icon.svg';
// import activeFert from 'img/tokens/fert-logo-active.svg';
import forecast from 'img/beanstalk/forecast-banner.svg';
import { useSelector } from 'react-redux';
import { ANALYTICS_LINK, SupportedChainId } from '../constants';
import RewardsBar from '../components/Silo/RewardsBar';
import { AppState } from '../state';
import useFarmerSiloBreakdown from '../hooks/useFarmerSiloBalances';
import useChainId from '../hooks/useChain';
import NextSeason from '../components/Silo/NextSeason';
import { displayFullBN } from '../util';
import Stat from '../components/Common/Stat';

const ForecastPage: React.FC = () => {
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  const { sunrise, season } = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const breakdown = useFarmerSiloBreakdown();
  const chainId = useChainId();
  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title={<strong>Forecast</strong>}
          description="View conditions on the Bean Farm"
          control={(
            <Button
              href={ANALYTICS_LINK}
              target="_blank"
              rel="noreferrer"
              color="light"
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ transform: 'rotate(-45deg)' }} />}
            >
              View More Analytics
            </Button>
          )}
        />
        {/* TEMP: Hide next Season metrics on MAINNET. */}
        {chainId !== SupportedChainId.MAINNET && (
          <NextSeason
            title="DUMMY ACCORDION. REPLACE LATER."
          />
        )}
        <Stack direction="row" justifyContent="space-between" gap={2}>
          <Card>
            <Stack direction="row" sx={{ p: 1 }}>
              <Box>
                <Stat
                  title="Time Weighted Average Price"
                  amount={`$${displayFullBN(breakdown.totalValue.abs(), 2)}`}
                  icon={undefined}
                />

              </Box>
            </Stack>
            <Typography>test</Typography>

          </Card>
        </Stack>

      </Stack>
    </Container>
  );
};

export default ForecastPage;
