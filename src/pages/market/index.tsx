import React from 'react';
import { Box, Container, Stack, Tab, Typography } from '@mui/material';
import PageHeader from '~/components/Common/PageHeader';
import useTabs from '~/hooks/display/useTabs';
import AllListings from '~/components/Market/Tables/AllListings';
import AllOrders from '~/components/Market/Tables/AllOrders';
import CreateButtons from '~/components/Market/CreateButtons';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import MarketGraph from '~/components/Market/MarketGraph';
import { Module, ModuleContent, ModuleHeader, ModuleTabs } from '~/components/Common/Module';
import GuideButton from '~/components/Common/Guide/GuideButton';
import { HOW_TO_BUY_PODS, HOW_TO_SELL_PODS } from '~/util';

const SLUGS = ['buy', 'sell'];
const PodMarketPage: React.FC = () => {
  /// Tabs
  const [tab, handleChangeTab] = useTabs(SLUGS, 'view');
  const data = useMarketData();
  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeader
          title="The Pod Market"
          description="Trade the Beanstalk-native debt asset"
          href="https://docs.bean.money/farm/market#the-pod-market"
          OuterStackProps={{
            alignItems: 'end'
          }}
          control={
            <Stack direction="row" alignItems="center" gap={1}>
              <GuideButton
                title="The Farmers' Almanac: Market Guides"
                guides={[
                  HOW_TO_BUY_PODS,
                  HOW_TO_SELL_PODS
                ]}
              />
              <CreateButtons />
            </Stack>
          }
        />
        {/**
          * Graph
          */}
        <Module sx={{ overflow: 'visible' }}> 
          <ModuleHeader>
            <Typography variant="h4">Overview</Typography>
          </ModuleHeader>
          <Box sx={{ width: '100%', height: '400px', position: 'relative', overflow: 'visible' }}>
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
        </Module>
        {/**
          * Buy Now and Sell Now
          */}
        <Module>
          <ModuleTabs value={tab} onChange={handleChangeTab}>
            <Tab label="Buy Now" />
            <Tab label="Sell Now" />
          </ModuleTabs>
          <ModuleContent>
            {tab === 0 && <AllListings data={data} />}
            {tab === 1 && <AllOrders data={data} />}
          </ModuleContent>
        </Module>
      </Stack>
    </Container>
  );
};
export default PodMarketPage;
