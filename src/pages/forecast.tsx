import React, { useState } from 'react';
import { Box, Button, Card, Container, Stack, Tab, Tabs, Typography } from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import duneIcon from 'img/dune-icon.svg';
// import activeFert from 'img/tokens/fert-logo-active.svg';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBalances';
import useChainId from 'hooks/useChain';
import NextSeason from 'components/Silo/NextSeason';
import Stat from 'components/Common/Stat';
import TokenIcon from 'components/Common/TokenIcon';
import { BEAN } from 'constants/tokens';
import BigNumber from 'bignumber.js';
import { displayFullBN } from '../util';
import { ANALYTICS_LINK, SupportedChainId } from '../constants';

const ForecastPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
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
          <Card sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
              <Stat
                title="Time Weighted Average Price"
                color="primary"
                amount={`$${displayFullBN(breakdown.totalValue.abs(), 2)}`}
                icon={undefined}
                topIcon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
              />
              <Box>
                <Typography>Last cross: 2m ago</Typography>
              </Box>
            </Stack>
            <Typography>test</Typography>
          </Card>
          <Card sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
              <Stat
                title="Pod Rate"
                amount={`${displayFullBN(breakdown.totalValue.abs(), 2)}%`}
                icon={undefined}
                topIcon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
              />
              <Box>
                <Typography>Last cross: 2m ago</Typography>
              </Box>
            </Stack>
            <Typography>test</Typography>
          </Card>
        </Stack>
        <Card sx={{ p: 2, width: '100%' }}>
          <Tabs value={tab} onChange={handleChangeTab}>
            <Tab label="Liquidity Over Time" />
            <Tab label="Liquidity By State" />
          </Tabs>
          <Stat
            title="Total Beanstalk Liquidity"
            amount={`$${displayFullBN(new BigNumber(1000000))}`}
            icon={undefined}
          />
        </Card>
      </Stack>
    </Container>
  );
};

export default ForecastPage;
