import React from 'react';
import {
  Stack,
  Typography,
  Card, Box, CardProps,
} from '@mui/material';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import podIcon from 'img/beanstalk/pod-icon.svg';
import BigNumber from 'bignumber.js';
import { BeanstalkPalette, IconSize } from '../../App/muiTheme';
import { displayBN } from '../../../util';
import { PodOrder } from '../Plots.mock';

export type PlotDetailsCardProps = {
  podListing: PodOrder | undefined;
  harvestableIndex: BigNumber;
}

const PlotOrderDetails: React.FC<PlotDetailsCardProps & CardProps> = ({
  sx,
  podListing,
  harvestableIndex
}) => {
  if (podListing === undefined) {
    return null;
  }
  return (
    <Card sx={{ p: 2, ...sx }}>
      <Stack gap={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" gap={1} alignItems="center">
            <Typography variant="h4">Pod Order</Typography>
            <Box sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: BeanstalkPalette.washedGreen,
              color: BeanstalkPalette.logoGreen
            }}>
              <Typography variant="body1">{podListing.account.substring(0, 6)}</Typography>
            </Box>
          </Stack>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Stack gap={0.5}>
            <Typography variant="body1">Place in Line</Typography>
            {/* <Typography variant="h1" sx={{ fontWeight: 400 }}>613,964</Typography> */}
            <Typography variant="bodyLarge">0
              - {displayBN(new BigNumber(podListing.maxPlaceInLine).minus(harvestableIndex))}
            </Typography>
          </Stack>
          <Stack gap={0.5}>
            <Typography variant="body1">Price per Pod</Typography>
            <Stack direction="row" gap={0.3} alignItems="center">
              <img src={beanIcon} alt="" height={IconSize.medium} />
              <Typography variant="bodyLarge">{displayBN(podListing.pricePerPod)}</Typography>
            </Stack>
          </Stack>
          <Stack gap={0.5}>
            <Typography variant="body1">Pods Purchased</Typography>
            <Stack direction="row" gap={0.3} alignItems="center">
              <img src={podIcon} alt="" height={IconSize.medium} />
              <Typography variant="bodyLarge">
                {displayBN(podListing.filledAmount)}/{displayBN(podListing.totalAmount)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default PlotOrderDetails;
