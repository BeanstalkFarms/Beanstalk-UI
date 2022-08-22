import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Container,
  Divider,
  Stack, Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import CancelOrder from '~/components/Market/Actions/CancelOrder';
import GenericZero from '~/components/Common/ZeroState/GenericZero';
import usePodOrder from '~/hooks/usePodOrder';
import useAccount from '~/hooks/ledger/useAccount';
import { useBeanstalkContract } from '~/hooks/useContract';
import { bigNumberResult, Source } from '~/util';
import FillOrder from '../../components/Market/Actions/FillOrder';
import OrderDetails from '../../components/Market/Cards/OrderDetails';
import PageHeaderSecondary from '../../components/Common/PageHeaderSecondary';

const OrderPage: React.FC = () => {
  const account = useAccount();
  const { id } = useParams<{ id: string }>();
  const { data: order, source, loading, error } = usePodOrder(id);
  const beanstalk = useBeanstalkContract();

  const [orderValid, setOrderValid] = useState<null | boolean>(null);
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const _order = await beanstalk.podOrderById(id.toString()).then(bigNumberResult);
          console.debug('[pages/order] order = ', _order);
          setOrderValid(_order?.gt(0));
        } catch (e) {
          console.error(e);
          setOrderValid(false);
        }
      })();
    }
  }, [beanstalk, id]);

  //
  if (loading) {
    return (
      <GenericZero loading />
    );
  }
  if (error) {
    return (
      <GenericZero title="Error">
        <Typography>{error.message.toString()}</Typography>
      </GenericZero>
    );
  }
  if (!order || !orderValid) {
    return (
      <GenericZero title="Not found">
        <Typography>Order not found.</Typography>
      </GenericZero>
    );
  }

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeaderSecondary
          title={(
            <Stack direction="row" gap={0.5} alignItems="center">
              {/* <AddressIcon address={order.account} /> */}
              <Typography variant="h2">
                Order {order.id.substring(0, 8)}
              </Typography>
            </Stack>
          )}
          returnPath="/market"
        />
        <Card sx={{ p: 1 }}>
          <Box p={1}>
            <OrderDetails
              podOrder={order}
            />
          </Box>
          {account === order.account ? (
            <Box>
              <Divider
                color="secondary"
                sx={{ my: 1, borderWidth: 0, borderTopWidth: 1, }}
              />
              <CancelOrder
                order={order}
              />
            </Box>
          ) : null}
        </Card>
        {account === order.account ? null : (
          <Card sx={{ position: 'relative' }}>
            <Stack gap={1.5} sx={{ p: 1 }}>
              <Box sx={{ pt: 1, px: 1 }}>
                <Typography variant="h4">Fill</Typography>
              </Box>
              <Box>
                <FillOrder
                  podOrder={order}
                />
              </Box>
            </Stack>
          </Card>
        )}
        <Box>
          <Typography color="text.secondary" textAlign="right">
            Data source: {source === Source.SUBGRAPH ? 'Subgraph' : 'RPC'}
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default OrderPage;
