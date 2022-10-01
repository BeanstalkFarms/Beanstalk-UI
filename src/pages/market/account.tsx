import React from 'react';
import {
  Box, Button,
  Card,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography, useMediaQuery,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import PageHeaderSecondary from '../../components/Common/PageHeaderSecondary';
import useTabs from '~/hooks/display/useTabs';
import AddressIcon from '~/components/Common/AddressIcon';
import MyOrdersTable from '~/components/Market/Pods/Tables/MyOrders';
import MyListingsTable from '~/components/Market/Pods/Tables/MyListings';
import Row from '~/components/Common/Row';

const SLUGS = ['orders', 'listings'];
const MarketAccountPage: React.FC = () => {
  /// Theme
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /// Tabs
  const [tab, handleChangeTab] = useTabs(SLUGS, 'view');

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeaderSecondary
          returnPath="/market"
          title={(
            <Row gap={1}>
              <AddressIcon />
              <Typography variant="h2">My Pod Market</Typography>
            </Row>
          )}
        />
        <Card>
          <Row sx={{ pt: 2, px: 2, pb: 1.5 }} justifyContent="space-between">
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
                sx={{ p: 0, '&:hover': { backgroundColor: 'transparent' } }}
              >
                {isMobile ? '+ Create Order' : '+ Create New Order'}
              </Button>
            )}
            {tab === 1 && (
              <Button
                component={Link}
                to="/market/create"
                size="small"
                color="primary"
                variant="text"
                sx={{ p: 0, '&:hover': { backgroundColor: 'transparent' } }}
              >
                {isMobile ? '+ Create Listing' : '+ Create New Listing'}
              </Button>
            )}
          </Row>
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
