import React from 'react';
import { Dialog, DialogProps, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import PlotSelect from '../Common/PlotSelect';
import { AppState } from '../../state';

export interface SelectPlotDialogProps {
  /** Closes dialog */
  handleClose: any;
  /** Sets plot index */
  handlePlotSelect: any;
  /** Farmer field app state */
  farmerField: AppState['_farmer']['field'];
  /** Beanstalk field app state */
  beanstalkField: AppState['_beanstalk']['field'];
}

const SelectPlotDialog: React.FC<SelectPlotDialogProps & DialogProps> = ({
  farmerField,
  beanstalkField,
  handlePlotSelect,
  handleClose,
  onClose,
  open
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
      <StyledDialogContent>
        <Stack gap={2}>
          <PlotSelect
            handlePlotSelect={handleSelectAndClose}
            plots={farmerField?.plots}
            harvestableIndex={beanstalkField?.harvestableIndex}
          />
        </Stack>
      </StyledDialogContent>
    </Dialog>
  );
};

export default SelectPlotDialog;
