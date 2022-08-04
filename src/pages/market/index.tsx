import React from 'react';
import { Box, Card, Container, Stack, Tab, Tabs } from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import useTabs from 'hooks/display/useTabs';
import AllListings from 'components/Market/Tables/AllListings';
import AllOrders from 'components/Market/Tables/AllOrders';
import CreateButtons from '../../components/Market/CreateButtons';

const SLUGS = ['buy', 'sell'];
const PodMarketPage: React.FC = () => {
  const [tab, handleChangeTab] = useTabs(SLUGS, 'view');

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
    </>
  );

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeader
          title="The Pod Market"
          description="Trade the Beanstalk-native debt asset"
          href="https://docs.bean.money/farm/market#the-pod-market"
          control={<CreateButtons />}
        />
        {content}
      </Stack>
    </Container>
  );
};
export default PodMarketPage;
