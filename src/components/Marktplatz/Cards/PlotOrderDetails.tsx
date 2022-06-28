import React from 'react';
import {
  Stack,
  Typography,
  Card, Box, CardProps,
} from '@mui/material';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import podIcon from 'img/beanstalk/pod-icon.svg';
import BigNumber from 'bignumber.js';
import { BeanstalkPalette } from '../../App/muiTheme';
import { displayBN, displayFullBN } from '../../../util';
import { PodOrder } from '../Plots.mock';

export type PlotDetailsCardProps = {
  podListing: PodOrder | undefined;
  harvestableIndex: BigNumber;
}

const PlotOrderDetails: React.FC<PlotDetailsCardProps & CardProps> =
  ({
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
            <Stack direction="row" gap={0.3} alignItems="center">
              <Typography>Pod Listing</Typography>
              <Box sx={{
                px: 0.5,
                py: 0.2,
                borderRadius: 0.5,
                backgroundColor: BeanstalkPalette.washedGreen,
                color: BeanstalkPalette.logoGreen
              }}>
                <Typography>{podListing.account.substring(0, 6)}</Typography>
              </Box>
            </Stack>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Stack>
              <Typography>Place in Line</Typography>
              {/* <Typography variant="h1" sx={{ fontWeight: 400 }}>613,964</Typography> */}
              <Typography variant="h1" sx={{ fontWeight: 400 }}>0
                - {displayBN(new BigNumber(podListing.maxPlaceInLine).minus(harvestableIndex))}
              </Typography>
            </Stack>
            <Stack>
              <Typography>Price per Pod</Typography>
              <Stack direction="row" gap={0.3} alignItems="center">
                <Typography variant="h1" sx={{ fontWeight: 400 }}>{displayBN(podListing.pricePerPod)}</Typography>
                <img src={beanIcon} alt="" height="25px" />
              </Stack>
            </Stack>
            <Stack>
              <Typography>Pods Purchased</Typography>
              <Stack direction="row" gap={0.3} alignItems="center">
                <Typography
                  variant="h1"
                  sx={{ fontWeight: 400 }}>{displayBN(podListing.filledAmount)}/{displayBN(podListing.totalAmount)}
                </Typography>
                <img src={podIcon} alt="" height="25px" />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Card>
    );
  };

export default PlotOrderDetails;
