import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Container,
  Divider,
  Stack, Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import CancelOrder from '~/components/Market/Pods/Actions/CancelOrder';
import GenericZero from '~/components/Common/ZeroState/GenericZero';
import usePodOrder from '~/hooks/beanstalk/usePodOrder';
import useAccount from '~/hooks/ledger/useAccount';
import { useBeanstalkContract } from '~/hooks/ledger/useContract';
import { bigNumberResult, Source } from '~/util';
import FillOrder from '../../components/Market/Pods/Actions/FillOrder';
import OrderDetails from '../../components/Market/Pods/Cards/OrderDetails';
import PageHeaderSecondary from '../../components/Common/PageHeaderSecondary';
import { Module, ModuleContent, ModuleHeader } from '~/components/Common/Module';
import Row from '~/components/Common/Row';

const OrderPage: React.FC = () => {
  const account = useAccount();
  const { id } = useParams<{ id: string }>();
  const { data: order, source, loading, error } = usePodOrder(id);
  const beanstalk = useBeanstalkContract();

  /// Verify that this order is still live via the contract.
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

  /// Loading isn't complete until orderValid is set
  if (loading || orderValid === null) {
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
            <Row gap={0.5}>
              <Typography variant="h2">
                Order {order.id.substring(0, 8)}
              </Typography>
            </Row>
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
                sx={{ my: 1, borderWidth: 0, borderTopWidth: 1 }}
              />
              <CancelOrder
                order={order}
              />
            </Box>
          ) : null}
        </Card>
        {account === order.account ? null : (
          <Module>
            <ModuleHeader>
              <Typography variant="h4">Fill</Typography>
            </ModuleHeader>
            <ModuleContent>
              <FillOrder
                podOrder={order}
              />
            </ModuleContent>
          </Module>
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
