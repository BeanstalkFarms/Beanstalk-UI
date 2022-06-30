import React from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Box, Button,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import BigNumber from 'bignumber.js';
import { BeanstalkPalette } from '../../App/muiTheme';
import { PodListing } from '../Plots.mock';
import PlotListingDetails from "../Cards/PlotListingDetails";

const MyListingsDialog: React.FC<{ podListing: PodListing | undefined; handleClose: any; harvestableIndex: BigNumber; } & DialogProps> = ({
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
