import React from 'react';
import {
  Box,
  Card,
  Container,
  Stack, Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { usePodOrderQuery } from 'generated/graphql';
import { castPodOrder } from 'state/farmer/market';
import FillOrder from '../../components/Market/Actions/FillOrder';
import OrderDetails from '../../components/Market/Cards/OrderDetails';
import AddressIcon from '../../components/Common/AddressIcon';
import PageHeaderSecondary from '../../components/Common/PageHeaderSecondary';

const OrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data, loading, error } = usePodOrderQuery({ variables: { id: id || '' }, skip: !id });

  if (loading) return <div>Loading</div>;
  if (error) return <div>{error}</div>;
  if (!data?.podOrder) return <div>Not found</div>;

  const order = castPodOrder(data?.podOrder);

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeaderSecondary
          title={(
            <Stack direction="row" gap={0.5} alignItems="center">
              <AddressIcon address={order.account} />
              <Typography variant="h2">{`${order.account.substring(0, 7)}...'s Pod Order`}</Typography>
            </Stack>
          )}
          returnPath="/market"
        />
        <OrderDetails
          podOrder={order}
        />
        <Card sx={{ position: 'relative' }}>
          <Stack gap={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
              <Typography variant="h4">Sell Pods to Pod Order</Typography>
            </Stack>
            <Box sx={{ px: 1, pb: 1 }}>
              <FillOrder
                podOrder={order}
              />
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default OrderPage;
