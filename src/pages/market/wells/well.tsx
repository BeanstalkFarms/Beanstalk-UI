import React from 'react';
import { Button,
  Card,
  Container, Divider, Grid,
  Stack, Typography
} from '@mui/material';
import { Link } from 'react-router-dom';
import PageHeaderSecondary from '~/components/Common/PageHeaderSecondary';
import WhitelistBadge from '~/components/Market/Wells/WhitelistBadge';
import Row from '~/components/Common/Row';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN, STALK } from '~/constants/tokens';
import WellCharts from '~/components/Market/Wells/Charts';
import WellActivity from '~/components/Market/Wells/Tables';
import { Module } from '~/components/Common/Module';

const WellPage: React.FC = () => (
  <Container maxWidth="lg">
    <Stack gap={2}>
      <PageHeaderSecondary
        title="BEAN:ETH"
        returnPath="/market/wells"
      />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', p: 1 }}>
            <Stack justifyContent="space-between" height="100%">
              <Stack p={1} pb={2} gap={1}>
                <Row justifyContent="space-between">
                  <Typography variant="h4">Well Overview</Typography>
                  <WhitelistBadge isWhitelisted />
                </Row>
                <Stack
                  gap={1}
                  p={1.5}
                  sx={{
                    backgroundColor: BeanstalkPalette.lightestBlue,
                    borderRadius: 1
                  }}
                >
                  <Row justifyContent="space-between">
                    <Row gap={0.5}>
                      <TokenIcon token={BEAN[1]} />
                      <Typography>BEAN</Typography>
                    </Row>
                    <Typography>750,135 (50.05%)</Typography>
                  </Row>
                  <Row justifyContent="space-between">
                    <Row gap={0.5}>
                      <TokenIcon token={BEAN[1]} />
                      <Typography>ETH</Typography>
                    </Row>
                    <Typography>35.15 (49.95%)</Typography>
                  </Row>
                  <Divider />
                  <Row justifyContent="space-between">
                    <Typography>Current DeltaB</Typography>
                    <Typography>-10,000</Typography>
                  </Row>
                </Stack>
                <Stack gap={1} px={1}>
                  <Row justifyContent="space-between">
                    <Typography>Type</Typography>
                    <Typography>Constant Product</Typography>
                  </Row>
                  <Row justifyContent="space-between">
                    <Typography>Total Volume (7D)</Typography>
                    <Typography>$353,353</Typography>
                  </Row>
                  <Row justifyContent="space-between">
                    <Typography>Beans Earned by Depositors (7D)</Typography>
                    <Row gap={0.3}>
                      <TokenIcon token={BEAN[1]} />
                      <Typography>136,361</Typography>
                    </Row>
                  </Row>
                  <Row justifyContent="space-between">
                    <Typography>Stalk Grown by Depositors (7D)</Typography>
                    <Row gap={0.3}>
                      <TokenIcon token={STALK} />
                      <Typography>36,361</Typography>
                    </Row>
                  </Row>
                </Stack>
              </Stack>
              {/* TODO: if whitelisted, link to specific pool in the silo */}
              <Button fullWidth component={Link} to="/silo">
                <Typography variant="h4">Deposit Liquidity through the Silo</Typography>
              </Button>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={8}>
          <WellCharts />
        </Grid>
      </Grid>
      <Module sx={{ p: 2 }} />
      <WellActivity />
    </Stack>
  </Container>
);

export default WellPage;
