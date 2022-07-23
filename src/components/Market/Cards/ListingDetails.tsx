import React from 'react';
import {
  Stack,
  Typography,
  Card, Box, CardProps,
} from '@mui/material';
import BigNumber from 'bignumber.js';
import { PodListing } from 'state/farmer/market';
import { displayBN, displayFullBN } from 'util/index';
import { BeanstalkPalette, IconSize } from 'components/App/muiTheme';
import TokenIcon from 'components/Common/TokenIcon';
import { BEAN, PODS } from 'constants/tokens';

export type ListingDetailsProps = {
  podListing: PodListing;
  harvestableIndex: BigNumber;
}

const ListingDetails: React.FC<ListingDetailsProps & CardProps> = ({
  sx,
  podListing,
  harvestableIndex
}) => (
  <Card sx={{ p: 2, ...sx }}>
    <Stack gap={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap={1} alignItems="center">
          <Typography variant="h4">
            Pod Listing
          </Typography>
          <Box sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: BeanstalkPalette.washedGreen,
              color: BeanstalkPalette.logoGreen
            }}>
            <Typography variant="body1">
              {podListing.account.substring(0, 6)}
            </Typography>
          </Box>
        </Stack>
        <Typography color={BeanstalkPalette.gray} variant="bodySmall">
          Listing expires at position <Typography color={BeanstalkPalette.black} variant="bodySmall" display="inline">500,000</Typography> in the Pod Line
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        {/* Place in Line */}
        <Stack gap={0.5}>
          <Typography variant="body1">
            Place in Line
          </Typography>
          <Typography variant="bodyLarge">
            {displayBN(podListing.index.minus(harvestableIndex))}
          </Typography>
        </Stack>
        {/* Price per Pod */}
        <Stack gap={0.5}>
          <Typography variant="body1">
            Price per Pod
          </Typography>
          <Stack direction="row" gap={0.3} alignItems="center">
            <TokenIcon token={BEAN[1]} style={{ height: IconSize.medium }} />
            <Typography variant="bodyLarge">
              {displayFullBN(podListing.pricePerPod)}
            </Typography>
          </Stack>
        </Stack>
        {/* Pods Sold */}
        <Stack gap={0.5}>
          <Typography variant="body1">
            Pods Sold
          </Typography>
          <Stack direction="row" gap={0.3} alignItems="center">
            <TokenIcon token={PODS} style={{ height: IconSize.medium }} />
            <Typography variant="bodyLarge">
              {displayBN(podListing.filledAmount)}/{displayBN(podListing.totalAmount)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  </Card>
  );

export default ListingDetails;
