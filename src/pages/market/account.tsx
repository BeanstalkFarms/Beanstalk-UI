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

const SLUGS = ['orders', 'listings'];
const MarketAccountPage: React.FC = () => {
  ///
  const [tab, handleChangeTab] = useTabs(SLUGS, 'view');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
