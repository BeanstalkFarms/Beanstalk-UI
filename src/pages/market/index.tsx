import React from 'react';
import { Box, Card, Container, Stack, Tab, Tabs } from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
// import MarketPlots from 'components/Market/MarketPlots';
import useChainId from 'hooks/useChain';
import useTabs from 'hooks/display/useTabs';
import AllListings from 'components/Market/Tables/AllListings';
import AllOrders from 'components/Market/Tables/AllOrders';
import CreateButtons from '../../components/Market/CreateButtons';

const PodMarketPage: React.FC = () => {
  const chainId = useChainId();
  const [tab, handleChangeTab] = useTabs();

  // const 

  const content = (
    <>
      {/** Graph */}
      {/* <Card sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="center" height={300}>
            <Typography variant="h2">insert graph</Typography>
          </Box>
        </Card> */}
      {/** Buy Now and Sell Now */}
      <Card>
        <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }}
            variant="scrollable"
          >
            <Tab
              label="Buy Now"
              // iconPosition="start"
              // icon={<img src={buyNowIcon} alt="" />}
            />
            <Tab
              label="Sell Now"
              // icon={<img src={sellNowIcon} alt="" />}
              // iconPosition="start"
            />
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
    </>
  );

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeader
          title="The Pod Market"
          description="Trade Pods, the Beanstalk-native debt asset"
          href="https://docs.bean.money/farm/market"
          control={<CreateButtons />}
        />
        {content}
      </Stack>
    </Container>
  );
};
export default PodMarketPage;
