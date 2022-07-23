import React from 'react';
import {
  Box,
  Card,
  Container,
  Stack, Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { mockPodOrderData } from '../../components/Market/Plots.mock';
import FillOrder from '../../components/Market/Actions/FillOrder';
import OrderDetails from '../../components/Market/Cards/OrderDetails';
import { AppState } from '../../state';
import AddressIcon from '../../components/Common/AddressIcon';
import { getAccount } from '../../util';
import PageHeaderSecondary from '../../components/Common/PageHeaderSecondary';

const OrderPage: React.FC = () => {
  // id of pod order
  // eslint-disable-next-line
  const { id } = useParams<{ id: string }>();
  
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeaderSecondary
          title={(
            <Stack direction="row" gap={0.5} alignItems="center">
              <AddressIcon address={mockPodOrderData[0].account} />
              <Typography variant="h2">{`${getAccount(mockPodOrderData[0].account).substring(0, 7)}...'s Pod Order`}</Typography>
            </Stack>
          )}
          returnPath="/market"
        />
        <OrderDetails podListing={mockPodOrderData[0]} harvestableIndex={beanstalkField.harvestableIndex} />
        <Card sx={{ position: 'relative' }}>
          <Stack gap={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
              <Typography variant="h4">Sell Pods to Pod Order</Typography>
            </Stack>
            <Box sx={{ px: 1, pb: 1 }}>
              <FillOrder podOrder={mockPodOrderData[0]} />
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default OrderPage;
