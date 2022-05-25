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

export interface HorizontalScrollProps {
  viewAllFertilizer: boolean;
  handleCloseFertilizerDialog: (val?: any) => void;
}

const FertDialog: React.FC<HorizontalScrollProps> = ({viewAllFertilizer, handleCloseFertilizerDialog}) => {
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
        {/*<FertDataGrid token={} siloToken={}*/}
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default FertDialog;
