import React from 'react';
import { Box, Card, Container, Stack, Tab, Tabs } from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
// import MarketPlots from 'components/Market/MarketPlots';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import useChainId from 'hooks/useChain';
import useTabs from 'hooks/display/useTabs';
import AllListings from 'components/Market/Tables/AllListings';
import { SupportedChainId } from '../../constants';
import CreateButtons from '../../components/Market/CreateButtons';

const PodMarketPage: React.FC = () => {
  const chainId = useChainId();
  const [tab, handleChangeTab] = useTabs();

  // const 

  let content;
  if (chainId === SupportedChainId.MAINNET) {
    content = (
      <ComingSoonCard title="Pod Market" />
    );
  } else {
    content = (
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
          <Box sx={{ px: 1 }}>
            {tab === 0 && (
              <AllListings />
            )}
            {/* {tab === 0 && (
              <MarketTable
                columns={LISTING_COLUMNS}
                rows={mockPodListingData}
                maxRows={8}
                onRowClick={handleClickListing}
              />
            )}
            {tab === 1 && (
              <MarketTable
                columns={ORDER_COLUMNS}
                rows={mockPodOrderData}
                maxRows={8}
                onRowClick={handleClickOrder}
              />
            )} */}
          </Box>
        </Card>
      </>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeader
          title="The Pod Market"
          description="Trade Pods, the Beanstalk-native debt asset"
          control={<CreateButtons />}
        />
        {content}
      </Stack>
    </Container>
  );
};
export default PodMarketPage;
