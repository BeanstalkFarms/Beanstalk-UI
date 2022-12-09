import React from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import {
  OrderbookAggregation,
  PriceBuckets,
} from '~/hooks/beanstalk/useOrderbook';

const OrdersAndListings: React.FC<{
  data: PriceBuckets;
  aggregation: OrderbookAggregation;
}> = ({ data, aggregation }) => {
  const t = '';

  return (
    <Stack>
      {/* Column headers */}
      <Grid>
        <Typography variant="h4">Orders & Listings</Typography>
      </Grid>
    </Stack>
  );
};

export default OrdersAndListings;
