import React, { useCallback, useMemo } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Box, Button, Typography, Card,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import BigNumber from 'bignumber.js';
import { FormTokenState } from '../../Common/Form';
import { BeanstalkPalette } from '../../App/muiTheme';
import beanIcon from '../../../img/tokens/bean-logo-circled.svg';
import podIcon from '../../../img/beanstalk/pod-icon.svg';
import { displayBN, displayFullBN } from '../../../util';
import { PodListing, PodOrder } from '../Plots.mock';

export type BuyOrderFormValues = {
  placeInLine: BigNumber | null;
  pricePerPod: BigNumber | null;
  tokens: FormTokenState[];
}

const MyOrdersDialog: React.FC<{ podListing: PodOrder | undefined; handleClose: any; harvestableIndex: BigNumber; } & DialogProps> =
  ({
     open,
     sx,
     onClose,
     fullWidth,
     fullScreen,
     disableScrollLock,
     handleClose,
     podListing,
     harvestableIndex
   }) => {
    const handleDialogClose = () => {
      handleClose();
    };

    console.log('POD LISTING', podListing);

    if (podListing === undefined) {
      return null;
    }

    return (
      <Dialog
        onClose={onClose}
        open={open}
        fullWidth={fullWidth}
        fullScreen={fullScreen}
        disableScrollLock={disableScrollLock}
        sx={{ ...sx }}
      >
        <Box>
          <StyledDialogTitle
            onClose={handleDialogClose}
          >
            View Pod Order
          </StyledDialogTitle>
          <StyledDialogContent>
            <Stack gap={2}>
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
                      <Typography variant="h1" sx={{ fontWeight: 400 }}>0 - {displayFullBN(new BigNumber(podListing.maxPlaceInLine).minus(harvestableIndex), 0)}</Typography>
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
                        <Typography variant="h1" sx={{ fontWeight: 400 }}>{displayBN(podListing.filledAmount)}/{displayBN(podListing.totalAmount)}</Typography>
                        <img src={podIcon} alt="" height="25px" />
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
              <Button
                variant="outlined"
                sx={{
                  p: 1,
                  color: BeanstalkPalette.washedRed,
                  borderColor: BeanstalkPalette.washedRed,
                  '&:hover': {
                    backgroundColor: BeanstalkPalette.hoverRed,
                    borderColor: BeanstalkPalette.washedRed,
                    border: 1.1,
                    opacity: 1
                  }
                }}
              >
                Cancel Order
              </Button>
            </Stack>
          </StyledDialogContent>
        </Box>
      </Dialog>
    );
  };

export default MyOrdersDialog;
