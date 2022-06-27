import React from 'react';
import {
  Stack,
  Typography,
  Card, Box, CardProps,
} from '@mui/material';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import podIcon from 'img/beanstalk/pod-icon.svg';
import BigNumber from 'bignumber.js';
import { PodListing } from './Plots.mock';
import { displayBN, displayFullBN } from '../../util';
import { BeanstalkPalette } from '../App/muiTheme';

export type PlotListingCardProps = {
  podListing: PodListing | undefined;
  harvestableIndex: BigNumber;
}

const PlotListingDetails: React.FC<PlotListingCardProps & CardProps> =
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
                - {displayFullBN(new BigNumber(podListing.index).minus(harvestableIndex), 0)}
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
              <Typography>Pods Sold</Typography>
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

export default PlotListingDetails;
