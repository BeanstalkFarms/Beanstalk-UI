import React, { useCallback, useMemo } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Box,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { Formik, FormikHelpers } from 'formik';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import BuyOrderForm from '../Forms/BuyOrderForm';
import { AppState } from '../../../state';
import useChainConstant from '../../../hooks/useChainConstant';
import { BEAN, ETH } from '../../../constants/tokens';
import useFarmerBalances from '../../../hooks/useFarmerBalances';
import { FormTokenState } from '../../Common/Form';

export type BuyOrderFormValues = {
  placeInLine: BigNumber | null;
  pricePerPod: BigNumber | null;
  tokens: FormTokenState[];
}

const BuyOrderDialog: React.FC<{ handleClose: any; } & DialogProps> = ({
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
  
  const Bean = useChainConstant(BEAN);
  const Eth = useChainConstant(ETH);
  const balances = useFarmerBalances();
  
  const initialValues: BuyOrderFormValues = useMemo(() => ({
    placeInLine: null,
    pricePerPod: null,
    tokens: [
      {
        token: Eth,
        amount: null,
      },
    ],
  }), [Eth]);

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
                    token={BEAN[1]}
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
