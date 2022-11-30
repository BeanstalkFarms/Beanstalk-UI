import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import GenericZero from '~/components/Common/ZeroState/GenericZero';
import { bigNumberResult } from '~/util';
import { useBeanstalkContract } from '~/hooks/ledger/useContract';
import usePodOrder from '~/hooks/beanstalk/usePodOrder';
import FillOrderV2 from '~/components/Market/PodsV2/Actions/FillOrderV2';

const FillOrderWrapper: React.FC<{}> = () => {
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
    <FillOrderV2 podOrder={order} />
  );
};

export default FillOrderWrapper;
