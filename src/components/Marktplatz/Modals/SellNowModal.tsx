import React from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography,
  Card,
  Divider,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { displayBN } from '../../../util';

const SellNowModal: React.FC<{ row: any | undefined; handleClose: any; } & DialogProps> =
  ({
     open,
     sx,
     onClose,
     fullWidth,
     fullScreen,
     disableScrollLock,
     handleClose,
     row
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
        <StyledDialogTitle sx={{ pb: 0.5 }} onClose={handleDialogClose}>Sell Now</StyledDialogTitle>
        <StyledDialogContent>
          <Stack gap={2}>
            <Stack gap={1}>
              <Stack direction="row" justifyContent="space-between" sx={{ px: 1 }}>
                <Typography sx={{ width: '25%' }}>Place in Line</Typography>
                <Typography sx={{ width: '25%', textAlign: 'center' }}>Price</Typography>
                <Typography sx={{ width: '25%', textAlign: 'right' }}>Pods Requested</Typography>
              </Stack>
              <Card sx={{ p: 1 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ width: '25%' }}>{displayBN(row?.placeInLine)}</Typography>
                  <Typography sx={{ width: '25%', textAlign: 'center' }}>{displayBN(row?.price)}</Typography>
                  <Typography sx={{ width: '25%', textAlign: 'right' }}>{displayBN(row?.podsRequested)}</Typography>
                </Stack>
              </Card>
            </Stack>
            <Divider />
          </Stack>
        </StyledDialogContent>
      </Dialog>
    );
  };

export default SellNowModal;
