import React from 'react';
import { Box, CircularProgress, Container, Stack, Typography } from '@mui/material';
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
import Centered from '~/components/Common/ZeroState/Centered';
import { ChipLabel, StyledTab } from '~/components/Common/Tabs';

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
            // alignItems: 'end'
          }}
          control={
            <Stack direction={{ xs: 'row-reverse', md: 'row' }} justifyContent={{ xs: 'flex-end', md: 'flex-start' }} alignItems="center" gap={1}>
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
            {data.loading === false && data.listings !== undefined && data.orders !== undefined ? (
              <MarketGraph
                listings={data.listings}
                orders={data.orders}
                maxPlaceInLine={data.maxPlaceInLine}
                maxPlotSize={data.maxPlotSize}
                harvestableIndex={data.harvestableIndex}
              />
            ) : (
              <Centered>
                <CircularProgress variant="indeterminate" />
              </Centered>
            )}
          </Box>
        </Module>
        {/**
          * Buy Now and Sell Now
          */}
        <Module>
          <ModuleTabs value={tab} onChange={handleChangeTab}>
            <StyledTab label={
              <ChipLabel name="Buy Now">
                {data.listings?.length || 0}
              </ChipLabel>
            } />
            <StyledTab label={
              <ChipLabel name="Sell Now">
                {data.orders?.length || 0}
              </ChipLabel>
            } />
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
