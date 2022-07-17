import React from 'react';
import { Box, Card, Container, Stack, Typography } from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { mockPodOrderData } from '../../components/Market/Plots.mock';
import SellNow from '../../components/Market/Actions/SellNow';
import PlotOrderDetails from '../../components/Market/Cards/PlotOrderDetails';
import { AppState } from '../../state';

const OrderPage: React.FC = () => {
  // id of pod order
  const { id } = useParams<{ id: string }>();

  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeader returnPath="/market" />
        <PlotOrderDetails
          podListing={mockPodOrderData[0]}
          harvestableIndex={beanstalkField.harvestableIndex}
        />
        <Card sx={{ position: 'relative' }}>
          <Stack gap={1.5}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ overflow: 'visible', px: 2, pt: 2 }}
            >
              <Typography variant="h4">Sell Pods to Pod Order</Typography>
            </Stack>
            <Box sx={{ px: 1, pb: 1 }}>
              <SellNow podOrder={mockPodOrderData[0]} />
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default OrderPage;
