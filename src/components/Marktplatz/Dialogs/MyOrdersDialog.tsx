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
import PlotOrderDetails from "../Cards/PlotOrderDetails";

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
              <PlotOrderDetails podListing={podListing} harvestableIndex={harvestableIndex} />
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
