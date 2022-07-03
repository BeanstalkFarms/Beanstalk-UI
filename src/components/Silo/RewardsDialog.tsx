import React from 'react';
import { Dialog, DialogProps, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import PlotSelect from '../Common/PlotSelect';
import { AppState } from '../../state';

export interface RewardDialogProps {
  /** Closes dialog */
  handleClose: any;
}

const RewardsDialog: React.FC<RewardDialogProps & DialogProps> = ({
  handleClose,
  onClose,
  open
}) => (
  <Dialog
    onClose={onClose}
    open={open}
    fullWidth
    >
    <StyledDialogTitle onClose={handleClose}>My Plots</StyledDialogTitle>
    <StyledDialogContent>
      <Stack gap={2}>
        <Typography>TEST</Typography>
      </Stack>
    </StyledDialogContent>
  </Dialog>
  );

export default RewardsDialog;
