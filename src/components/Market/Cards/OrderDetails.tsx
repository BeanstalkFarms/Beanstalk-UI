import React from 'react';
import {
  Stack,
  Typography, Box, CardProps, Grid, Divider,
} from '@mui/material';
import { PodOrder } from 'state/farmer/market';
import Stat from 'components/Common/Stat';
import TokenIcon from 'components/Common/TokenIcon';
import { BEAN, PODS } from 'constants/tokens';
import { BeanstalkPalette, IconSize } from '../../App/muiTheme';
import { displayBN, displayFullBN } from '../../../util';

export type OrderDetailsProps = {
  podOrder: PodOrder | undefined;
}

const OrderDetails: React.FC<OrderDetailsProps & CardProps> = ({
  sx,
  podOrder,
}) => {
  if (!podOrder) return null;
  return (
    <Stack gap={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap={1} alignItems="center">
          <Typography variant="h4">Pod Order</Typography>
          {/* FIXME: use <Chip /> instead */}
          <Box sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: BeanstalkPalette.washedGreen,
            color: BeanstalkPalette.logoGreen
          }}>
            <Typography variant="body1">
              {podOrder.id.substring(0, 6)}
            </Typography>
          </Box>
        </Stack>
      </Stack>
      <Grid container>
        {/* Place in Line */}
        <Grid item xs>
          <Stat
            title="Place in Line"
            amount={`0 - ${displayBN(podOrder.maxPlaceInLine)}`}
            amountTooltip={(
              <>
                0 - {displayFullBN(podOrder.maxPlaceInLine)}
                <Divider sx={{ my: 1 }} />
                Any Pods in this range are eligible to be sold.
              </>
              )}
            variant="bodyLarge"
            gap={0.5}
            />
        </Grid>
        {/* Price per Pod */}
        <Grid item xs>
          <Stat
            title="Price per Pod"
            amount={displayBN(podOrder.pricePerPod)}
            amountIcon={<TokenIcon token={BEAN[1]} style={{ height: IconSize.medium }} />}
            amountTooltip={<>{displayFullBN(podOrder.pricePerPod)} Beans per Pod</>}
            variant="bodyLarge"
            gap={0.5}
            />
        </Grid>
        {/* Pods Sold */}
        <Grid item xs>
          <Stat
            title="Pods Remaining"
            amount={displayBN(podOrder.remainingAmount)}
            amountIcon={<TokenIcon token={PODS} style={{ height: IconSize.medium }} />}
            amountTooltip={`${displayFullBN(podOrder.remainingAmount)} Pods`}
            variant="bodyLarge"
            gap={0.5}
            />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default OrderDetails;
