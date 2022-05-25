/* eslint-disable */
import React from 'react';
import {makeStyles} from '@mui/styles';
import {StyledDialog, StyledDialogContent, StyledDialogTitle} from "../../../Common/Dialog";
import FertDataGrid from "./FertDataGrid";
import MyFertilizerHeader from "../MyFertilizerHeader";

const useStyles = makeStyles(() => ({
  scrollMenu: {
    alignItems: 'center'
  }
}));

export interface FertDialogProps {
  viewAllFertilizer: boolean;
  handleCloseFertilizerDialog: (val?: any) => void;
  dataGridRows: any[];
}

const FertDialog: React.FC<FertDialogProps> = ({viewAllFertilizer, handleCloseFertilizerDialog, dataGridRows}) => {
  const classes = useStyles();

  return (
    <StyledDialog
      open={viewAllFertilizer}
      fullWidth={true}
    >
      <StyledDialogTitle
        id="customized-dialog-title"
        onClose={handleCloseFertilizerDialog}
      >
        {/*Select token*/}
      </StyledDialogTitle>
      <StyledDialogContent sx={{padding: 2}}>
        <MyFertilizerHeader />
        <FertDataGrid
          rows={dataGridRows}
        />
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default FertDialog;
