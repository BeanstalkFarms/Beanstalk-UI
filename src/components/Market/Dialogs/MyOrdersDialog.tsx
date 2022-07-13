import React from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Box,
  Button
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import BigNumber from 'bignumber.js';
import { FormTokenState } from '../../Common/Form';
import { BeanstalkPalette } from '../../App/muiTheme';
import PlotOrderDetails from '../Cards/PlotOrderDetails';
import { PodOrder } from '../Plots.mock';

export type BuyOrderFormValues = {
  placeInLine: BigNumber | null;
  pricePerPod: BigNumber | null;
  tokens: FormTokenState[];
}

const MyOrdersDialog: React.FC<{
  podListing: PodOrder | undefined;
  handleClose: any;
  harvestableIndex: BigNumber;
} & DialogProps> = ({
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
        <StyledDialogTitle onClose={handleClose}>
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
