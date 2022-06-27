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
import PlotOrderDetails from '../Cards/PlotOrderDetails';
import { BeanstalkPalette } from '../../App/muiTheme';
import beanIcon from '../../../img/tokens/bean-logo-circled.svg';
import podIcon from '../../../img/beanstalk/pod-icon.svg';
import { displayBN, displayFullBN } from '../../../util';
import { PodListing } from '../Plots.mock';
import PlotListingDetails from "../Cards/PlotListingDetails";

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
              <PlotListingDetails podListing={podListing} harvestableIndex={harvestableIndex} />
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
