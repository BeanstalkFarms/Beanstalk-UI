import React, { useCallback, useMemo, useState } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography,
  Card,
  Divider,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { Formik, FormikHelpers } from 'formik';
import { displayBN } from '../../../util';
import PlotOrderDetails from '../PlotOrderDetails';
import { BeanstalkPalette } from '../../App/muiTheme';
import podIcon from '../../../img/beanstalk/pod-icon.svg';
import { AppState } from '../../../state';
import { ZERO_BN } from '../../../constants';
import { SellListingFormValues } from './SellListingDialog';
import SellListingForm from '../Forms/SellListingForm';
import SellNowForm from '../Forms/SellNowForm';
import { PodOrder } from '../Plots.mock';

export type SellNowFormValues = {
  min: BigNumber | null;
  max: BigNumber | null;
  amount: BigNumber | null;
}

const SellNowDialog: React.FC<{ podListing: PodOrder | undefined; handleClose: any; harvestableIndex: BigNumber } & DialogProps> =
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
    const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
      (state) => state._farmer.field
    );

    const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
      (state) => state._beanstalk.field
    );

    const [tab, setTab] = useState(0);
    const [selectedPlotIndex, setSelectedPlotIndex] = useState<string | null>(null);

    const handleDialogClose = () => {
      handleClose();
      setTab(0);
    };

    const handleNextTab = () => {
      setTab(tab + 1);
    };
    const handlePreviousTab = () => {
      setTab(tab - 1);
    };

    const handleSetPlot = (index: string) => {
      setSelectedPlotIndex(index);
      handleNextTab();
    };

    //
    const initialValues: SellNowFormValues = useMemo(() => ({
      min: ZERO_BN,
      max: selectedPlotIndex ? new BigNumber(farmerField.plots[selectedPlotIndex]) : ZERO_BN,
      amount: selectedPlotIndex ? new BigNumber(farmerField.plots[selectedPlotIndex]) : ZERO_BN,
    }), [selectedPlotIndex, farmerField]);
    
    //
    const onSubmit = useCallback((values: SellNowFormValues, formActions: FormikHelpers<SellNowFormValues>) => {
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
        {tab === 0 && (
          <>
            <StyledDialogTitle sx={{ pb: 0.5 }} onClose={handleDialogClose}>Select Plot to sell</StyledDialogTitle>
            <StyledDialogContent>
              <Stack gap={2}>
                <PlotOrderDetails podListing={podListing} harvestableIndex={harvestableIndex} />
                <Stack gap={1}>
                  {Object.keys(farmerField?.plots).map((index) => (
                    <Card
                      sx={{
                        p: 2,
                        '&:hover': {
                          backgroundColor: BeanstalkPalette.hoverBlue,
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleSetPlot(index)}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" gap={0.4}>
                          <Typography
                            sx={{ fontSize: '18px' }}>{displayBN(new BigNumber(index).minus(beanstalkField?.harvestableIndex))}
                          </Typography>
                          <Typography sx={{ fontSize: '18px' }}>in Line</Typography>
                        </Stack>
                        <Stack direction="row" gap={0.3} alignItems="center">
                          <Typography
                            sx={{ fontSize: '18px' }}>{displayBN(new BigNumber(farmerField.plots[index]))}
                          </Typography>
                          <img src={podIcon} alt="" height="18px" />
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </StyledDialogContent>
          </>
        )}
        {tab === 1 && (
          <>
            <StyledDialogTitle sx={{ pb: 0.5 }} onBack={handlePreviousTab} onClose={handleDialogClose}>Sell Pods</StyledDialogTitle>
            <StyledDialogContent>
              <Stack gap={2}>
                <PlotOrderDetails podListing={podListing} harvestableIndex={harvestableIndex} />
                <Formik initialValues={initialValues} onSubmit={onSubmit}>
                  {(formikProps) => (
                    <>
                      {selectedPlotIndex && (
                        <SellNowForm
                          plot={farmerField.plots[selectedPlotIndex]}
                          placeInLine={new BigNumber(selectedPlotIndex).minus(beanstalkField?.harvestableIndex)}
                          numPods={new BigNumber(farmerField.plots[selectedPlotIndex])}
                          {...formikProps}
                        />
                      )}
                    </>
                  )}
                </Formik>
              </Stack>
            </StyledDialogContent>
          </>
        )}
      </Dialog>
    );
  };

export default SellNowDialog;
