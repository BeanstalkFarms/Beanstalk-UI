import React from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Stack, Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import usePodOrder from 'hooks/usePodOrder';
import { Source } from 'util/index';
import useAccount from 'hooks/ledger/useAccount';
import FillOrder from '../../components/Market/Actions/FillOrder';
import OrderDetails from '../../components/Market/Cards/OrderDetails';
import PageHeaderSecondary from '../../components/Common/PageHeaderSecondary';

const OrderPage: React.FC = () => {
  const account = useAccount();
  const { id } = useParams<{ id: string }>();
  const { data: order, source, loading, error } = usePodOrder(id);

  if (loading) return <div>Loading</div>;
  if (error) return <div>{error}</div>;
  if (!order) return <div>Not found</div>;

  /// TEMP: override order for testing
  // const order : PodOrder = {
  //   id: '0x61f2026bb26606482187137f1c06fc85b999036e0b1641cb1a84e02a1e785cd3',
  //   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  //   maxPlaceInLine: new BigNumber('600000000'),
  //   totalAmount: new BigNumber('19982.345012'),
  //   pricePerPod: new BigNumber('0.5'),
  //   remainingAmount: new BigNumber('19982.345012'),
  //   filledAmount: new BigNumber('0'),
  //   status: 'active'
  // };

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
              <Button
                color="error"
                variant="text"
                fullWidth
                >
                Cancel
              </Button>
            </Box>
          ) : null}
        </Card>
        {account === order.account ? null : (
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
        )}
        <Box sx={{ }}>
          <Typography color="text.secondary">
            Data source: {source === Source.SUBGRAPH ? 'Subgraph' : 'RPC'}
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default OrderPage;
