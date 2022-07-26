import React from 'react';
import {
  Stack,
  Typography,
  Card, CardProps, Grid, Button,
} from '@mui/material';
import BigNumber from 'bignumber.js';
import { PodListing } from 'state/farmer/market';
import { displayBN } from 'util/index';
import { BeanstalkPalette, IconSize } from 'components/App/muiTheme';
import TokenIcon from 'components/Common/TokenIcon';
import { BEAN, PODS } from 'constants/tokens';
import Stat from 'components/Common/Stat';
import AddressIcon from 'components/Common/AddressIcon';

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
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            sx={{
              fontWeight: 400,
              color: 'text.primary'
            }}
            href={`https://etherscan.io/address/${podListing.account}`}
            target="_blank"
            rel="noreferrer"
          >
            <Stack direction="row" alignItems="center" gap={0.5}>
              <AddressIcon
                address={podListing.account}
                size={IconSize.small}
              />
              <Typography>{podListing.account.substring(0, 6)}</Typography>
            </Stack>
          </Button>
          {/* <Box sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: BeanstalkPalette.washedGreen,
            color: BeanstalkPalette.logoGreen
          }}>
            <Typography variant="body1">
              {podListing.account.substring(0, 6)}
            </Typography>
          </Box> */}
        </Stack>
        <Typography color={BeanstalkPalette.gray} variant="bodySmall">
          Listing expires at position <Typography color={BeanstalkPalette.black} variant="bodySmall" display="inline">500,000</Typography> in the Pod Line
        </Typography>
      </Stack>
      <Grid container>
        {/* Place in Line */}
        <Grid item xs>
          <Stat
            title="Place in Line"
            amount={displayBN(podListing.index.minus(harvestableIndex))}
            variant="bodyLarge"
            gap={0.5}
          />
        </Grid>
        {/* Price per Pod */}
        <Grid item xs>
          <Stat
            title="Price per Pod"
            amount={displayBN(podListing.pricePerPod)}
            amountIcon={<TokenIcon token={BEAN[1]} style={{ height: IconSize.medium }} />}
            variant="bodyLarge"
            gap={0.5}
          />
        </Grid>
        {/* Pods Sold */}
        <Grid item xs>
          <Stat
            title="Pods Available"
            amount={displayBN(podListing.remainingAmount)}
            amountIcon={<TokenIcon token={PODS} style={{ height: IconSize.medium }} />}
            variant="bodyLarge"
            gap={0.5}
          />
        </Grid>
      </Grid>
    </Stack>
  </Card>
);

export default ListingDetails;
