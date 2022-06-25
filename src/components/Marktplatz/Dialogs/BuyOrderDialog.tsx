import React, { useCallback, useMemo } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography, Box,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { Formik, FormikHelpers } from 'formik';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import SellListingForm from '../Forms/SellListing/SellListingForm';
import { ZERO_BN } from '../../../constants';
import BuyOrderForm from '../Forms/BuyOrder/BuyOrderForm';
import { AppState } from '../../../state';

export type BuyOrderFormValues = {
  placeInLine: BigNumber | null;
  pricePerPod: BigNumber | null;
}

const BuyOrderDialog: React.FC<{ handleClose: any; } & DialogProps> =
  ({
     open,
     sx,
     onClose,
     fullWidth,
     fullScreen,
     disableScrollLock,
     handleClose
   }) => {
    const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
      (state) => state._beanstalk.field
    );

    const handleDialogClose = () => {
      handleClose();
    };
    
    const initialValues: BuyOrderFormValues = useMemo(() => ({
      placeInLine: null,
      pricePerPod: null,
    }), []);

    //
    const onSubmit = useCallback((values: BuyOrderFormValues, formActions: FormikHelpers<BuyOrderFormValues>) => {
      Promise.resolve();
    }, []);

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
            Create Pod Listing
          </StyledDialogTitle>
          <StyledDialogContent>
            <Stack gap={2}>
              <Formik initialValues={initialValues} onSubmit={onSubmit}>
                {(formikProps) => (
                  <>
                    <BuyOrderForm
                      podLine={beanstalkField.totalPods.minus(beanstalkField.harvestableIndex)}
                      {...formikProps}
                    />
                  </>
                )}
              </Formik>
            </Stack>
          </StyledDialogContent>
        </Box>
      </Dialog>
    );
  };

export default BuyOrderDialog;
