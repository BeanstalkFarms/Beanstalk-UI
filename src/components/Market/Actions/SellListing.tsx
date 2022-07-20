import { Box, Button, InputAdornment, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { SettingInput, TokenAdornment, TokenInputField, TxnSettings } from 'components/Common/Form';
import { ZERO_BN } from 'constants/index';
import { BEAN, PODS } from 'constants/tokens';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { MaxBN, MinBN } from 'util/index';
import DestinationField from 'components/Field/DestinationField';
import { FarmToMode } from 'lib/Beanstalk/Farm';
import FieldWrapper from '../../Common/Form/FieldWrapper';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import useToggle from '../../../hooks/display/useToggle';
import SelectPlotDialog from '../../Field/SelectPlotDialog';
import DoubleSliderField from '../../Common/Form/DoubleSliderField';

export type SellListingFormValues = {
  //
  plotIndex: string | null;
  //
  amount: BigNumber | null;
  start:  BigNumber;
  end:    BigNumber | null;
  pricePerPod: BigNumber | null;
  expiresAt:   BigNumber | null;
  //
  destination: FarmToMode
}

const PricePerPodInputProps = {
  inputProps: { step: '0.01' },
  endAdornment: (
    <TokenAdornment
      token={BEAN[1]}
    />
  )
};
const ExpiresAtInputProps = {
  endAdornment: (
    <InputAdornment position="end">
      <Box sx={{ pr: 1 }}>
        <Typography sx={{ fontSize: '18px' }}>Place in Line</Typography>
      </Box>
    </InputAdornment>
  )
};

const SellListingForm: React.FC<FormikProps<SellListingFormValues>> = ({
  values,
  setFieldValue,
}) => {
  const [dialogOpen, showDialog, hideDialog] = useToggle();
  
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );

  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );
  
  const placeInLine = values.plotIndex !== null ? new BigNumber(values.plotIndex).minus(beanstalkField?.harvestableIndex) : ZERO_BN;
  const numPods = values.plotIndex !== null ? new BigNumber(farmerField.plots[values.plotIndex]) : ZERO_BN;
  
  const handlePlotSelect = useCallback((index: string) => {
    setFieldValue('plotIndex', index);
    setFieldValue('start', ZERO_BN);
    setFieldValue('end', new BigNumber(farmerField.plots[index]));
    setFieldValue('amount', values.end?.minus(values.start ? values.start : ZERO_BN));
    setFieldValue('expiresAt', new BigNumber(index).minus(beanstalkField?.harvestableIndex));
  }, [beanstalkField?.harvestableIndex, farmerField.plots, setFieldValue, values.end, values.start]);
  
  const handleChangeAmount = (amount: BigNumber | null) => {
    if (!amount) {
      setFieldValue('start', numPods);
      setFieldValue('end', numPods);
    } else {
      const delta = (values?.end || ZERO_BN).minus(amount);
      setFieldValue('start', MaxBN(ZERO_BN, delta));
      if (delta.lt(0)) {
        setFieldValue('end', MinBN(numPods, (values?.end || ZERO_BN).plus(delta.abs())));
      }
    }
  };

  useEffect(() => {
    setFieldValue('amount', values.end?.minus(values.start ? values.start : ZERO_BN));
  }, [values.start, values.end, setFieldValue]);

  return (
    <Form noValidate>
      <SelectPlotDialog
        farmerField={farmerField}
        beanstalkField={beanstalkField}
        handlePlotSelect={handlePlotSelect}
        handleClose={hideDialog}
        open={dialogOpen}
      />
      <Stack gap={1}>
        {(values?.plotIndex === null)
          ? (
            <FieldWrapper>
              <TokenInputField
                name="amount"
                handleChange={handleChangeAmount}
                disabled
                fullWidth
                InputProps={{
                  endAdornment: (
                    <TokenAdornment
                      token={PODS}
                      onClick={showDialog}
                      buttonLabel="Select Plot"
                    />
                  ),
                }}
              />
            </FieldWrapper>
          ) : (
            <>
              <FieldWrapper>
                <TokenInputField
                  name="amount"
                  handleChange={handleChangeAmount}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <TokenAdornment
                        token={PODS}
                        onClick={showDialog}
                      />
                    ),
                  }}
                  balance={farmerField.plots[values.plotIndex]}
                  balanceLabel="Plot Size"
                />
              </FieldWrapper>
              <FieldWrapper>
                <DoubleSliderField
                  balance={numPods}
                  sliderFields={['start', 'end']}
                />
              </FieldWrapper>
              <FieldWrapper label="Price Per Pod" tooltip={POD_MARKET_TOOLTIPS.pricePerPod}>
                <TokenInputField
                  name="pricePerPod"
                  placeholder="0.0000"
                  InputProps={PricePerPodInputProps}
                />
              </FieldWrapper>
              <FieldWrapper label="Expires At" tooltip={POD_MARKET_TOOLTIPS.expiresAt}>
                <TokenInputField
                  name="expiresAt"
                  placeholder="0.0000"
                  balanceLabel="Max Value"
                  balance={placeInLine.plus(values.start ? values.start : ZERO_BN)}
                  InputProps={ExpiresAtInputProps}
                />
              </FieldWrapper>
              <DestinationField
                name="destination"
              />
              {/* <Warning
                message="Pods in this Plot are already Listed on the Pod Market. Listing Pods from the same Plot will replace the previous Pod Listing."
              /> */}
            </>
          )}

        <Button fullWidth size="large" type="submit">
          Create Listing
        </Button>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const SellListing: React.FC<{}> = () => {
  const initialValues: SellListingFormValues = useMemo(() => ({
    plotIndex:   null,
    amount:      null,
    start:       ZERO_BN,
    end:         null,
    pricePerPod: null,
    expiresAt:   null,
    destination: FarmToMode.INTERNAL,
  }), []);

  // eslint-disable-next-line unused-imports/no-unused-vars
  const onSubmit = useCallback((values: SellListingFormValues, formActions: FormikHelpers<SellListingFormValues>) => {
    // console.log('CARD: ', values.destination);
    Promise.resolve();
  }, []);

  return (
    <Formik<SellListingFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<SellListingFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <SellListingForm
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default SellListing;
