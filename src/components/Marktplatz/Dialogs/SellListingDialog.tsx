import React, { useCallback, useMemo, useState } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography, Card, Box,
} from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { Formik, FormikHelpers } from 'formik';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import podIcon from 'img/beanstalk/pod-icon.svg';
import SellListingForm from '../Forms/SellListing/SellListingForm';
import { AppState } from '../../../state';
import { displayBN } from '../../../util';
import { BeanstalkPalette } from '../../App/muiTheme';
import { ZERO_BN } from '../../../constants';

export type SellListingFormValues = {
  option: number | null;
  min: BigNumber | null;
  max: BigNumber | null;
  amount: BigNumber | null;
  pricePerPod: BigNumber | null;
  expiresAt: BigNumber
}

const SellListingDialog: React.FC<{ handleClose: any; } & DialogProps> = ({
     open,
     sx,
     onClose,
     fullWidth,
     fullScreen,
     disableScrollLock,
     handleClose
   }) => {
    const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
      (state) => state._farmer.field
    );

    const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
      (state) => state._beanstalk.field
    );

    const [tab, setTab] = useState(0);
    const [selectedPlotIndex, setSelectedPlotIndex] = useState<string | null>(null);

    // Handlers
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

    //
    const initialValues: SellListingFormValues = useMemo(() => ({
      option: null,
      min: ZERO_BN,
      max: selectedPlotIndex ? new BigNumber(farmerField.plots[selectedPlotIndex]) : ZERO_BN,
      amount: selectedPlotIndex ? new BigNumber(farmerField.plots[selectedPlotIndex]) : ZERO_BN,
      pricePerPod: null,
      expiresAt: selectedPlotIndex ? new BigNumber(selectedPlotIndex).minus(beanstalkField?.harvestableIndex) : ZERO_BN,
    }), [selectedPlotIndex, farmerField, beanstalkField?.harvestableIndex]);

    //
    const onSubmit = useCallback((values: SellListingFormValues, formActions: FormikHelpers<SellListingFormValues>) => {
      console.log('CARD: ', values.option);
      Promise.resolve();
    }, []);

    const handleSetPlot = (index: string) => {
      setSelectedPlotIndex(index);
      handleNextTab();
    };

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
          <Box>
            <StyledDialogTitle sx={{ pb: 0.5 }} onClose={handleDialogClose}>Select Plot to List</StyledDialogTitle>
            <StyledDialogContent>
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
                        <Typography sx={{ fontSize: '18px' }}>{displayBN(new BigNumber(index).minus(beanstalkField?.harvestableIndex))}</Typography>
                        <Typography sx={{ fontSize: '18px' }}>in Line</Typography>
                      </Stack>
                      <Stack direction="row" gap={0.3} alignItems="center">
                        <Typography sx={{ fontSize: '18px' }}>{displayBN(new BigNumber(farmerField.plots[index]))}</Typography>
                        <img src={podIcon} alt="" height="18px" />
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </StyledDialogContent>
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <StyledDialogTitle
              onBack={handlePreviousTab}
              onClose={handleDialogClose}
            >
              Create Pod Listing
            </StyledDialogTitle>
            <StyledDialogContent>
              <Stack gap={2}>
                <Formik initialValues={initialValues} onSubmit={onSubmit}>
                  {(formikProps) => (
                    <>
                      {selectedPlotIndex && (
                        <SellListingForm
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
          </Box>
        )}
      </Dialog>
    );
  };

export default SellListingDialog;
