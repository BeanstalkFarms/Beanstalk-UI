import React, { useCallback, useMemo } from 'react';
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
import BuyOrderForm from '../Forms/BuyOrder/BuyOrderForm';
import { BEAN, ETH } from '../../../constants/tokens';
import { BuyOrderFormValues } from './BuyOrderDialog';
import useChainConstant from '../../../hooks/useChainConstant';
import { FormTokenState } from '../../Common/Form';
import BuyNowForm from '../Forms/BuyNow/BuyNowForm';

export type BuyNowFormValues = {
  tokens: FormTokenState[];
}

const BuyNowDialog: React.FC<{ podListing: any | undefined; handleClose: any; } & DialogProps> =
  ({
     open,
     sx,
     onClose,
     fullWidth,
     fullScreen,
     disableScrollLock,
     handleClose,
     podListing
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
            <Card sx={{ p: 2 }}>
              <Stack gap={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" gap={0.3} alignItems="center">
                    <Typography>Pod Listing</Typography>
                    <Box sx={{ px: 0.5, py: 0.2, borderRadius: 0.5, backgroundColor: BeanstalkPalette.washedGreen, color: BeanstalkPalette.logoGreen }}>
                      <Typography>0x1243</Typography>
                    </Box>
                  </Stack>
                  <Typography color={BeanstalkPalette.gray}>Listing expires when Plot is at <Typography display="inline" color={BeanstalkPalette.black}>500,000</Typography> in the Pod Line</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Stack>
                    <Typography>Place in Line</Typography>
                    <Typography variant="h1" sx={{ fontWeight: 400 }}>613,964</Typography>
                  </Stack>
                  <Stack>
                    <Typography>Pripe per Pod</Typography>
                    <Stack direction="row" gap={0.3} alignItems="center">
                      <Typography variant="h1" sx={{ fontWeight: 400 }}>613,964</Typography>
                      <img src={beanIcon} alt="" height="25px" />
                    </Stack>
                  </Stack>
                  <Stack>
                    <Typography>Pods Sold</Typography>
                    <Stack direction="row" gap={0.3} alignItems="center">
                      <Typography variant="h1" sx={{ fontWeight: 400 }}>0/113,403</Typography>
                      <img src={podIcon} alt="" height="25px" />
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
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
