import React from 'react';
import {
  Box, Button,
  Card,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import useTabs from 'hooks/display/useTabs';
import MyOrdersTable from 'components/Market/Tables/MyOrders';
import AddressIcon from 'components/Common/AddressIcon';
import MyListingsTable from 'components/Market/Tables/MyListings';
import { Link } from 'react-router-dom';
import PageHeaderSecondary from '../../components/Common/PageHeaderSecondary';

const SLUGS = ['orders', 'listings'];
const MarketAccountPage: React.FC = () => {
  ///
  const [tab, handleChangeTab] = useTabs(SLUGS, 'view');

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeaderSecondary
          returnPath="/market"
          title={(
            <Stack direction="row" gap={1} alignItems="center">
              <AddressIcon />
              <Typography variant="h2">My Pod Market</Typography>
            </Stack>
          )}
        />
        <Card>
          <Stack sx={{ pt: 2, px: 2, pb: 1.5 }} direction="row" justifyContent="space-between" alignItems="center">
            <Tabs
              value={tab}
              onChange={handleChangeTab}
              sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }}
              variant="scrollable"
            >
              <Tab label="Orders" />
              <Tab label="Listings" />
            </Tabs>
            {tab === 0 && (
              <Button
                component={Link}
                to="/market/create"
                size="small"
                color="primary"
                variant="text"
                sx={{ p: 0, '&:hover': { backgroundColor: 'transparent' } }}>
                Create Order
              </Button>
            )}
            {tab === 1 && (
              <Button
                component={Link}
                to="/market/create"
                size="small"
                color="primary"
                variant="text"
                sx={{ p: 0, '&:hover': { backgroundColor: 'transparent' } }}>
                Create Listing
              </Button>
            )}
          </Stack>
          <Box px={1}>
            {tab === 0 && <MyOrdersTable />}
            {tab === 1 && <MyListingsTable />}
          </Box>
        </Card>
      </Stack>
    </Container>
  );
};

export default MarketAccountPage;
