import React from 'react';
import { Dialog, DialogProps, Typography } from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import PlotSelect from '../Common/PlotSelect';
import { AppState } from '../../state';

export interface PlotSelectDialogProps {
  /** Closes dialog */
  handleClose: any;
  /** Sets plot index */
  handlePlotSelect: any;
  /** Farmer field app state */
  farmerField: AppState['_farmer']['field'];
  /** Beanstalk field app state */
  beanstalkField: AppState['_beanstalk']['field'];
  /** index of the selected plot */
  selected?: string | null;
}

const PlotSelectDialog: React.FC<PlotSelectDialogProps & DialogProps> = ({
  farmerField,
  beanstalkField,
  handlePlotSelect,
  handleClose,
  onClose,
  open,
  selected
}) => {
  // sets plot index then closes dialog
  const handleSelectAndClose = (index: string) => {
    handlePlotSelect(index);
    handleClose();
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth
    >
      <StyledDialogTitle onClose={handleClose}>My Plots</StyledDialogTitle>
      <StyledDialogContent
        sx={{
          pb: 1, // enforces 10px padding around all 
        }}
      >
        {Object.keys(farmerField?.plots).length > 0 ? (
          <PlotSelect
            handlePlotSelect={handleSelectAndClose}
            plots={farmerField.plots!}
            harvestableIndex={beanstalkField?.harvestableIndex}
            selected={selected}
          />
        ) : (
          <Typography sx={{ textAlign: 'center', pt: 1, pb: 4 }}>
            You don&apos;t have any plots to send!
          </Typography>
        )}
      </StyledDialogContent>
    </Dialog>
  );
};

export default PlotSelectDialog;
