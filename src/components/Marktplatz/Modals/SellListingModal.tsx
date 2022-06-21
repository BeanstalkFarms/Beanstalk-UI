import React from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';

const SellListingModal: React.FC<{ handleClose: any; } & DialogProps> =
  ({
     open,
     sx,
     onClose,
     fullWidth,
     fullScreen,
     disableScrollLock,
     handleClose
   }) => {
    const handleDialogClose = () => {
      handleClose();
    };

    return (
      <Dialog
        onClose={onClose}
        open={open}
        fullWidth={fullWidth}
        fullScreen={fullScreen}
        disableScrollLock={disableScrollLock}
        sx={{ ...sx }}
      >
        <StyledDialogTitle sx={{ pb: 0.5 }} onClose={handleDialogClose}>Create Sell Listing</StyledDialogTitle>
        <StyledDialogContent>
          <Stack gap={2}>
            <Typography color="text.secondary">Unripe Beans represent a pro rata share of underlying Beans that are
              minted as Fertilizer is sold and debt is repaid to Fertilizer.
            </Typography>
          </Stack>
        </StyledDialogContent>
      </Dialog>
    );
  };

export default SellListingModal;
