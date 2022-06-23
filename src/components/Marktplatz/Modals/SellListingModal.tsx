import React, { useCallback, useMemo } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { Formik, FormikHelpers } from 'formik';
import SellListingForm from '../Forms/SellListing/SellListingForm';

export type SellListingFormValues = {
  destination: number | null;
}

const SellListingModal: React.FC<{ handleClose: any; } & DialogProps> =
  ({
     open,
     sx,
     onClose,
     fullWidth,
     fullScreen,
     disableScrollLock,
     handleClose
   }) => {
    const handleDialogClose = () => {
      handleClose();
    };

    //
    const initialValues: SellListingFormValues = useMemo(() => ({
      destination: null
    }), []);

    //
    const onSubmit = useCallback((values: SellListingFormValues, formActions: FormikHelpers<SellListingFormValues>) => {
      console.log('CARD: ', values.destination);
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
        <StyledDialogTitle sx={{ pb: 0.5 }} onClose={handleDialogClose}>Create Sell Listing</StyledDialogTitle>
        <StyledDialogContent>
          <Stack gap={2}>
            <Typography color="text.secondary">Unripe Beans represent a pro rata share of underlying Beans that are
              minted as Fertilizer is sold and debt is repaid to Fertilizer.
            </Typography>
            <Formik initialValues={initialValues} onSubmit={onSubmit}>
              {(formikProps) => <SellListingForm {...formikProps} />}
            </Formik>
          </Stack>
        </StyledDialogContent>
      </Dialog>
    );
  };

export default SellListingModal;
