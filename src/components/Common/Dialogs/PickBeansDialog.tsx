import React from 'react';
import { DialogProps, Stack, Dialog, Typography } from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from '../Dialog';

const PickBeansDialog: React.FC<{ handleClose: any; } & DialogProps> =
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
        <StyledDialogTitle onClose={handleDialogClose}>My Plots</StyledDialogTitle>
        <StyledDialogContent sx={{ pb: 0.5 }}>
          <Stack gap={2}>
            {/* Pod Balance */}
            <Typography>TEST</Typography>

          </Stack>
        </StyledDialogContent>
      </Dialog>
    );
  };

export default PickBeansDialog;
