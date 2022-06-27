import React, { useCallback, useMemo } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Box, Typography, Button, Card,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { Formik, FormikHelpers } from 'formik';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import BuyOrderForm from '../Forms/BuyOrderForm';
import { AppState } from '../../../state';
import useChainConstant from '../../../hooks/useChainConstant';
import { BEAN, ETH, PODS } from '../../../constants/tokens';
import useFarmerBalances from '../../../hooks/useFarmerBalances';
import { FormTokenState } from '../../Common/Form';
import PlotDetailsCard from './PlotDetailsCard';
import { BeanstalkPalette } from '../../App/muiTheme';
import beanIcon from '../../../img/tokens/bean-logo-circled.svg';
import podIcon from '../../../img/beanstalk/pod-icon.svg';
import { displayBN, displayFullBN } from '../../../util';
import { PodListing } from '../Plots.mock';

const MyListingsDialog: React.FC<{ podListing: PodListing | undefined; handleClose: any; harvestableIndex: BigNumber; } & DialogProps> =
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
            View Pod Listing
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
                    <Typography color={BeanstalkPalette.gray}>Listing expires when Plot is at <Typography display="inline" color={BeanstalkPalette.black}>{displayFullBN(new BigNumber(podListing.maxHarvestableIndex).minus(harvestableIndex), 0)} </Typography>
                      in the Pod Line
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Stack>
                      <Typography>Place in Line</Typography>
                      {/* <Typography variant="h1" sx={{ fontWeight: 400 }}>613,964</Typography> */}
                      <Typography variant="h1" sx={{ fontWeight: 400 }}>{displayFullBN(new BigNumber(podListing.index).minus(harvestableIndex), 0)}</Typography>
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
                Cancel Listing
              </Button>
            </Stack>
          </StyledDialogContent>
        </Box>
      </Dialog>
    );
  };

export default MyListingsDialog;
