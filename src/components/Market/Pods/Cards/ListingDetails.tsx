import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import BigNumber from 'bignumber.js';
import { IconSize } from '~/components/App/muiTheme';
import TokenIcon from '~/components/Common/TokenIcon';
import podListingIcon from '~/img/beanstalk/pod-listing-icon.svg';
import FarmerChip from '~/components/Common/FarmerChip';
import StatHorizontal from '~/components/Common/StatHorizontal';
import { BEAN, PODS } from '~/constants/tokens';
import { displayBN } from '~/util';
import { PodListing } from '~/state/farmer/market';
import Row from '~/components/Common/Row';

const ListingDetails: React.FC<{
  podListing: PodListing;
  harvestableIndex: BigNumber;
}> = ({
  podListing,
  harvestableIndex
}) => (
  <Stack gap={2}>
    <Row gap={1}>
      <img src={podListingIcon} style={{ width: IconSize.medium, height: IconSize.medium }} alt="Pod Listing" />
      <Typography variant="h4">Pod Listing</Typography>
      <Box sx={{ flex: 1, textAlign: 'right' }}>
        <FarmerChip account={podListing.account} />
      </Box>
    </Row>
    <Stack gap={1}>
      <StatHorizontal label="Place in Line" labelTooltip="The Place in Line of the first Pod in this Listing.">
        <Typography>{displayBN(podListing.index.minus(harvestableIndex))}</Typography>
      </StatHorizontal>
      <StatHorizontal label="Price per Pod" labelTooltip="The number of Beans requested per Pod.">
        <TokenIcon token={BEAN[1]} style={{ height: IconSize.xs }} />
        <Typography>{displayBN(podListing.pricePerPod)}</Typography>
      </StatHorizontal>
      <StatHorizontal label="Amount" labelTooltip="The number of Pods left to be purchased from this Listing.">
        <TokenIcon token={PODS} style={{ height: IconSize.xs }} />
        <Typography>{displayBN(podListing.remainingAmount)}</Typography>
      </StatHorizontal>
      <StatHorizontal label="Expires in" labelTooltip="If the Pod Line moves forward by this amount, this listing will automatically expire.">
        <Typography>{displayBN(podListing.maxHarvestableIndex.minus(harvestableIndex))} Pods</Typography>
      </StatHorizontal>
    </Stack>
  </Stack>
);

export default ListingDetails;
