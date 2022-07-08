import React, { useMemo } from 'react';
import { Dialog, DialogProps, Stack } from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import { FarmerSiloRewards } from '../../state/farmer/silo';
import { ClaimRewardsAction } from '../../lib/Beanstalk/Farm';
import ClaimRewards from './Actions/ClaimRewards';

export interface RewardDialogProps {
  /** Closes dialog */
  handleClose: any;
  beans: FarmerSiloRewards['beans'];
  stalk: FarmerSiloRewards['stalk'];
  seeds: FarmerSiloRewards['seeds'];
}

type ClaimRewardsFormValues = {
  action: ClaimRewardsAction | null;
}

const RewardsDialog: React.FC<RewardDialogProps & DialogProps> = ({
  handleClose,
  onClose,
  open,
  beans,
  stalk,
  seeds,
}) => {
  // Form
  const initialValues: ClaimRewardsFormValues = useMemo(() => ({
    action: null,
  }), []);

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth
      maxWidth="md"
    >
      <StyledDialogTitle onClose={handleClose}>Claim Rewards</StyledDialogTitle>
      <StyledDialogContent>
        <ClaimRewards />
      </StyledDialogContent>
    </Dialog>
  );
};

export default RewardsDialog;
