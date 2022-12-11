import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { bigNumberResult } from '~/util';
import { useBeanstalkContract } from '~/hooks/ledger/useContract';
import usePodOrder from '~/hooks/beanstalk/usePodOrder';
import FillOrderV2 from '~/components/Market/PodsV2/Actions/FillOrderV2';

const FillOrderWrapper: React.FC<{}> = () => {
  const { orderID } = useParams<{ orderID: string }>();
  const { data: order, source, loading, error } = usePodOrder(orderID);
  const beanstalk = useBeanstalkContract();

  /// Verify that this order is still live via the contract.
  const [orderValid, setOrderValid] = useState<null | boolean>(null);
  useEffect(() => {
    if (orderID) {
      (async () => {
        try {
          const _order = await beanstalk.podOrderById(orderID.toString()).then(bigNumberResult);
          console.debug('[pages/order] order = ', _order);
          setOrderValid(_order?.gt(0));
        } catch (e) {
          console.error(e);
          setOrderValid(false);
        }
      })();
    }
  }, [beanstalk, orderID]);

  /// Loading isn't complete until orderValid is set
  if (loading || orderValid === null) {
    return (
      <Stack height={200} alignItems="center" justifyContent="center">
        <CircularProgress color="primary" />
      </Stack>
    );
  }
  if (error) {
    return (
      <Stack height={200} alignItems="center" justifyContent="center">
        <Typography>{error.message.toString()}</Typography>
      </Stack>
    );
  }
  if (!order || !orderValid) {
    return (
      <Stack height={200} alignItems="center" justifyContent="center">
        <Typography>Order not found.</Typography>
      </Stack>
    );
  }

  return (
    <FillOrderV2 podOrder={order} />
  );
};

export default FillOrderWrapper;
