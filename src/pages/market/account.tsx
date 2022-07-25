import React from 'react';
import {
  Box,
  Card,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import useChainId from 'hooks/useChain';
import useAccount from 'hooks/ledger/useAccount';
import useTabs from 'hooks/display/useTabs';
import MyOrdersTable from 'components/Market/Tables/MyOrders';
import AddressIcon from 'components/Common/AddressIcon';
import { SupportedChainId } from 'constants/index';
import MyListingsTable from 'components/Market/Tables/MyListings';
import PageHeaderSecondary from '../../components/Common/PageHeaderSecondary';

const MarketAccountPage: React.FC = () => {
  ///
  const account = useAccount();
  const chainId = useChainId();

  ///
  const [tab, handleChangeTab] = useTabs();

  let content;
  if (chainId === SupportedChainId.MAINNET) {
    content = (
      <ComingSoonCard title="Pod Market" />
    );
  } else {
    content = (
      <Card>
        <Box sx={{ pt: 2, px: 2, pb: 1.5 }}>
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }}
            variant="scrollable"
          >
            <Tab label="My Orders" />
            <Tab label="My Listings" />
          </Tabs>
        </Box>
        <Box px={1}>
          {tab === 0 && <MyOrdersTable />}
          {tab === 1 && <MyListingsTable />}
        </Box>
      </Card>
    );
  }
      
  if (!account) return null;

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        {/* <PageHeader */}
        {/*  // fixme: trim account on mobile only */}
        {/*  title={( */}
        {/*    <Stack direction="row" gap={1} alignItems="center"> */}
        {/*      <AddressIcon /> */}
        {/*      <Typography variant="h1">My Pod Market</Typography> */}
        {/*    </Stack> */}
        {/*  )} */}
        {/*  description="Browse my open Pod Orders and Listings" */}
        {/*  control={<CreateButtons />} */}
        {/* /> */}
        <PageHeaderSecondary
          title={(
            <Stack direction="row" gap={1} alignItems="center">
              <AddressIcon />
              <Typography variant="h2">My Pod Market</Typography>
            </Stack>
          )}
          // description="Browse my open Pod Orders and Listings"
        />
        {content}
      </Stack>
    </Container>
  );
};

export default MarketAccountPage;
