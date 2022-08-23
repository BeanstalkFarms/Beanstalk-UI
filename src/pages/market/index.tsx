import React from 'react';
import { Box, Card, Container, Stack, Tab, Tabs, Typography } from '@mui/material';
import PageHeader from '~/components/Common/PageHeader';
import useTabs from '~/hooks/display/useTabs';
import AllListings from '~/components/Market/Tables/AllListings';
import AllOrders from '~/components/Market/Tables/AllOrders';
import CreateButtons from '../../components/Market/CreateButtons';
import BlurComponent from '../../components/Common/ZeroState/BlurComponent';
import LineChart from '../../components/Common/Charts/LineChart';
import { mockDepositData } from '../../components/Common/Charts/LineChart.mock';

const SLUGS = ['buy', 'sell'];
const PodMarketPage: React.FC = () => {
  /// Tabs
  const [tab, handleChangeTab] = useTabs(SLUGS, 'view');
  const handleCursor = () => null;

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeader
          title="The Pod Market"
          description="Trade the Beanstalk-native debt asset"
          href="https://docs.bean.money/farm/market#the-pod-market"
          control={<CreateButtons />}
        />
        {/**
          * Graph
          */}
        <Card>
          <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
            <Typography variant="h4">Overview</Typography>
          </Box>
          <Box sx={{ width: '100%', height: '200px', position: 'relative' }}>
            <BlurComponent sx={{ borderRadius: 1 }}>
              <Stack justifyContent="center" alignItems="center" gap={1}>
                <Typography variant="body1" color="gray">
                  The Pod Market overview graph is in development.
                </Typography>
              </Stack>
            </BlurComponent>
            <LineChart
              series={[mockDepositData]}
              onCursor={handleCursor}
            />
          </Box>
        </Card>
        {/**
          * Buy Now and Sell Now
          */}
        <Card>
          <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
            <Tabs
              value={tab}
              onChange={handleChangeTab}
              sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }}
              variant="scrollable"
            >
              <Tab label="Buy Now" />
              <Tab label="Sell Now" />
            </Tabs>
          </Box>
          <Box sx={{ px: 1, pb: 1 }}>
            {tab === 0 && (
              <AllListings />
            )}
            {tab === 1 && (
              <AllOrders />
            )}
          </Box>
        </Card>
      </Stack>
    </Container>
  );
};
export default PodMarketPage;
