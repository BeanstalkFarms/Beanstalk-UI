import React from 'react';
import {
  Stack,
  Typography, Box, Divider, Tooltip,
} from '@mui/material';
import { PodOrder } from '~/state/farmer/market';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN, PODS } from '~/constants/tokens';
import FarmerChip from '~/components/Common/FarmerChip';
import podOrderIcon from '~/img/beanstalk/pod-order-icon.svg';
import StatHorizontal from '~/components/Common/StatHorizontal';
import { displayBN, displayFullBN } from '../../../../util';
import { IconSize } from '../../../App/muiTheme';
import Row from '~/components/Common/Row';

import { FC } from '~/types';

export type OrderDetailsProps = {
  podOrder: PodOrder | undefined;
}

const OrderDetails: FC<OrderDetailsProps> = ({
  podOrder,
}) => {
  if (!podOrder) return null;
  return (
    <Stack gap={2}>
      <Row gap={1}>
        <img src={podOrderIcon} style={{ width: IconSize.medium, height: IconSize.medium }} alt="Pod Order" />
        <Typography variant="h4">Pod Order</Typography>
        <Box sx={{ flex: 1, textAlign: 'right' }}>
          <FarmerChip account={podOrder.account} />
        </Box>
      </Row>
      <Stack gap={1}>
        <StatHorizontal label="Place in Line" labelTooltip="Pods within this range can be used to Fill this Order.">
          <Tooltip title={(
            <>
              0 - {displayFullBN(podOrder.maxPlaceInLine)}
              <Divider sx={{ my: 1 }} />
              Any Pods in this range are eligible to be sold.
            </>
          )}>
            <Typography>0 - {displayBN(podOrder.maxPlaceInLine)}</Typography>
          </Tooltip>
        </StatHorizontal>
        <StatHorizontal label="Price per Pod" labelTooltip="The number of Beans offered per Pod.">
          <TokenIcon token={BEAN[1]} css={{ height: IconSize.xs }} />
          <Typography>{displayBN(podOrder.pricePerPod)}</Typography>
        </StatHorizontal>
        <StatHorizontal label="Amount" labelTooltip="The number of Pods left to be sold to this Order.">
          <TokenIcon token={PODS} css={{ height: IconSize.xs }} />
          <Typography>{displayBN(podOrder.remainingAmount)}</Typography>
        </StatHorizontal>
      </Stack>
    </Stack>
  );
};

export default OrderDetails;
