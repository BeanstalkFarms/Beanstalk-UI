import React from 'react';
import { Card, Container, Grid, Stack } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import Stat from 'components/Common/Stat';
import { BeanstalkPalette } from 'components/App/muiTheme';
import AmountRaisedCard from 'components/Analytics/Barnraise/AmountRaisedCard';
import BarnraiseCharts from 'components/Analytics/Barnraise/BarnraiseCharts';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import { AppState } from 'state';
import { displayBN } from 'util/index';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/index';

const BarnraiseAnalytics: React.FC<{}> = () => {
  const fertilizer = useSelector<
    AppState,
    AppState['_beanstalk']['fertilizer']
  >((state) => state._beanstalk.fertilizer);

  const chainId = useChainId();
  if (chainId === SupportedChainId.MAINNET) {
    return (
      <Container maxWidth="lg">
        <ComingSoonCard title="Barn Raise Analytics" />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <AmountRaisedCard totalRaised={fertilizer.totalRaised} />
        <Grid container direction="row" spacing={2}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2 }}>
              <Stat
                title="Total Outstanding Debt"
                amount={`${displayBN(new BigNumber(10000000))}`}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2 }}>
              <Stat
                title="Total Debt Repaid"
                amount={`${displayBN(new BigNumber(10000000))}`}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2 }}>
              <Stat
                title="Current Penalty for Ripening"
                color={BeanstalkPalette.washedRed}
                amount={`${displayBN(new BigNumber(95))}%`}
              />
            </Card>
          </Grid>
        </Grid>
        <BarnraiseCharts />
      </Stack>
    </Container>
  );
};

export default BarnraiseAnalytics;
