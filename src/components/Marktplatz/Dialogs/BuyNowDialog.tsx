import React, { useCallback, useMemo, useState } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography,
  Card, Divider, Box, useMediaQuery,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import podIcon from 'img/beanstalk/pod-icon.svg';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import BigNumber from 'bignumber.js';
import { Formik, FormikHelpers } from 'formik';
import { displayBN } from '../../../util';
import { BeanstalkPalette } from '../../App/muiTheme';
import SimplePodLineChart from '../../Field/PodLineChart';
import { AppState } from '../../../state';
import { PlotMap } from '../../../state/farmer/field';
import TokenQuoteProvider from '../../Common/Form/TokenQuoteProvider';
import BuyOrderForm from '../Forms/BuyOrderForm';
import { BEAN, ETH } from '../../../constants/tokens';
import { BuyOrderFormValues } from './BuyOrderDialog';
import useChainConstant from '../../../hooks/useChainConstant';
import { FormTokenState } from '../../Common/Form';
import BuyNowForm from '../Forms/BuyNowForm';
import PlotOrderDetails from '../Cards/PlotOrderDetails';
import { PodListing, PodOrder } from '../Plots.mock';
import PlotListingDetails from '../Cards/PlotListingDetails';

export type BuyNowFormValues = {
  tokens: FormTokenState[];
}

const BuyNowDialog: React.FC<{ podListing: PodListing | undefined; handleClose: any; harvestableIndex: BigNumber; } & DialogProps> =
  ({
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
