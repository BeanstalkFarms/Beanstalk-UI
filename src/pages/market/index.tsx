import React from 'react';
import { Box, Card, Container, Stack, Tab, Tabs, Typography } from '@mui/material';
import PageHeader from '~/components/Common/PageHeader';
import useTabs from '~/hooks/display/useTabs';
import AllListings from '~/components/Market/Tables/AllListings';
import AllOrders from '~/components/Market/Tables/AllOrders';
import CreateButtons from '~/components/Market/CreateButtons';
import useMarketData from '~/hooks/beanstalk/useMarketGraphData';
import MarketGraph from '~/components/Market/MarketGraph';

const SLUGS = ['buy', 'sell'];
const PodMarketPage: React.FC = () => {
  /// Tabs
  const [tab, handleChangeTab] = useTabs(SLUGS, 'view');
  const handleCursor = () => null;

  /// Data
  const data = useMarketData();

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
          <Box sx={{ width: '100%', height: '400px', position: 'relative' }}>
            {data.listings !== undefined && data.orders !== undefined ? (
              <MarketGraph
                listings={data.listings}
                orders={data.orders}
                maxPlaceInLine={data.maxPlaceInLine}
                maxPlotSize={data.maxPlotSize}
                harvestableIndex={data.harvestableIndex}
              />
            ) : (
              'Loading'
            )}
          </Box>
          {/* <Box>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </Box> */}
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
            {tab === 0 && <AllListings />}
            {tab === 1 && <AllOrders />}
          </Box>
        </Card>
      </Stack>
    </Container>
  );
};
export default PodMarketPage;
