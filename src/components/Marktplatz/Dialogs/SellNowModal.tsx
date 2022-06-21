import React, { useState } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography,
  useMediaQuery, Card, Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { GridRowParams } from '@mui/x-data-grid';
import { rowsMetaStateInitializer } from '@mui/x-data-grid/internals';
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [tab, setTab] = useState(0);

    console.log('ROW HERE', row);

    const handleDialogClose = () => {
      handleClose();
      setTab(0);
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
            {/* Pod Balance */}
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
