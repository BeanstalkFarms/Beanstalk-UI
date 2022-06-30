import React, { useCallback, useMemo } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  useMediaQuery,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import BigNumber from 'bignumber.js';
import { Formik, FormikHelpers } from 'formik';
import { AppState } from '../../../state';
import { BEAN, ETH } from '../../../constants/tokens';
import useChainConstant from '../../../hooks/useChainConstant';
import { FormState } from '../../Common/Form';
import BuyNowForm from '../Forms/BuyNowForm';
import { PodListing } from '../Plots.mock';
import PlotListingDetails from '../Cards/PlotListingDetails';

export type BuyNowFormValues = FormState

const BuyNowDialog: React.FC<{ 
  podListing: PodListing | undefined;
  handleClose: any;
  harvestableIndex: BigNumber;
} & DialogProps> = ({
  open,
  sx,
  onClose,
  fullWidth,
  fullScreen,
  disableScrollLock,
  handleClose,
  podListing,
  harvestableIndex
}) => {
  const handleDialogClose = () => {
    handleClose();
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );
  const podLine = beanstalkField?.podIndex.minus(beanstalkField.harvestableIndex);

  // const farmerPlots: PlotMap<BigNumber> = { [podListing.placeInLine]: '' };

  const Eth = useChainConstant(ETH);

  const initialValues: BuyNowFormValues = useMemo(() => ({
    tokens: [
      {
        token: Eth,
        amount: null,
      },
    ],
  }), [Eth]);

  //
  const onSubmit = useCallback((values: BuyNowFormValues, formActions: FormikHelpers<BuyNowFormValues>) => {
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
      <StyledDialogTitle sx={{ pb: 0.5 }} onClose={handleDialogClose}>Buy Now</StyledDialogTitle>
      <StyledDialogContent>
        <Stack gap={2}>
          <PlotListingDetails podListing={podListing} harvestableIndex={harvestableIndex} />
          <Formik initialValues={initialValues} onSubmit={onSubmit}>
            {(formikProps) => (
              <>
                <BuyNowForm
                  token={BEAN[1]}
                  {...formikProps}
                />
              </>
            )}
          </Formik>
        </Stack>
      </StyledDialogContent>
    </Dialog>
  );
};

export default BuyNowDialog;
