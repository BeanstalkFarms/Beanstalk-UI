import React from 'react';
import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';

import { useTheme } from '@mui/material/styles';
import BuySellCard from '../components/Marktplatz/BuySellCard';
import MyOrdersCard from '../components/Marktplatz/MyOrdersCard';

const MarketplacePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeader
          title={
            <>
              <strong>The Market</strong>
              <Box
                component="span"
                sx={{ display: { md: 'inline', xs: 'none' } }}
              >
                : The Pod Marketplace
              </Box>
            </>
          }
          description="Trade Pods, the Beanstalk-native debt asset."
        />
        <Card sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="center" height={300}>
            <Typography variant="h2">insert graph</Typography>
          </Box>
        </Card>
        <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between" gap={2} height="100%">
          <BuySellCard />
          <MyOrdersCard />
        </Stack>
        <Card sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="center" height={300}>
            <Typography variant="h2">insert table</Typography>
          </Box>
        </Card>
      </Stack>
    </Container>
  );
};
export default MarketplacePage;
