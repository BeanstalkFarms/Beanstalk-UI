import React from 'react';
import { Dialog, DialogProps } from '@mui/material';
import { PlotMap } from 'state/farmer/field';
import BigNumber from 'bignumber.js';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import PlotSelect from '../Common/PlotSelect';
import CardEmptyState from '../Common/CardEmptyState';

export interface PlotSelectDialogProps {
  /** Closes dialog */
  handleClose: any;
  /** Sets plot index */
  handlePlotSelect: any;
  /** */
  plots: PlotMap<BigNumber>;
  /** */
  harvestableIndex: BigNumber;
  /** index of the selected plot */
  selected?: string | null;
}

const PlotSelectDialog: React.FC<PlotSelectDialogProps & DialogProps> = ({
  // Custom
  handleClose,
  handlePlotSelect,
  plots,
  harvestableIndex,
  selected,
  // Dialog
  onClose,
  open,
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
        {Object.keys(plots).length > 0 ? (
          <PlotSelect
            handlePlotSelect={handleSelectAndClose}
            plots={plots!}
            harvestableIndex={harvestableIndex}
            selected={selected}
          />
        ) : (
          <CardEmptyState message="You don't have any plots to send!" />
        )}
      </StyledDialogContent>
    </Dialog>
  );
};

export default PlotSelectDialog;
