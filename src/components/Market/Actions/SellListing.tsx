import { Box, Button, InputAdornment, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { SettingInput, TokenAdornment, TokenInputField, TxnSettings } from 'components/Common/Form';
import { ZERO_BN } from 'constants/index';
import { BEAN, PODS } from 'constants/tokens';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { MaxBN, MinBN } from 'util/index';
import FieldWrapper from '../../Common/Form/FieldWrapper';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import RadioCardField from '../../Common/Form/RadioCardField';
import Warning from '../../Common/Form/Warning';
import useToggle from '../../../hooks/display/useToggle';
import SelectPlotDialog from '../../Field/SelectPlotDialog';
import DoubleSliderField from '../../Common/Form/DoubleSliderField';

export type SellListingFormValues = {
  option: number | null;
  min: BigNumber;
  max: BigNumber | null;
  amount: BigNumber | null;
  pricePerPod: BigNumber | null;
  expiresAt: BigNumber | null;
  plotIndex: string | null;
}

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
    setFieldValue('min', ZERO_BN);
    setFieldValue('max', new BigNumber(farmerField.plots[index]));
    setFieldValue('amount', values.max?.minus(values.min ? values.min : ZERO_BN));
    setFieldValue('expiresAt', new BigNumber(index).minus(beanstalkField?.harvestableIndex));
  }, [beanstalkField?.harvestableIndex, farmerField.plots, setFieldValue, values.max, values.min]);
  
  const handleChangeAmount = (amount: BigNumber) => {
    const delta = (values?.max || ZERO_BN).minus(amount);
    setFieldValue('min', MaxBN(ZERO_BN, delta));
    if (delta.lt(0)) {
      setFieldValue('max', MinBN(numPods, (values?.max || ZERO_BN).plus(delta.abs())));
    }
  };

  useEffect(() => {
    setFieldValue('amount', values.max?.minus(values.min ? values.min : ZERO_BN));
  }, [values.min, values.max, setFieldValue]);

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
        {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
        {(values?.plotIndex === null)
          ? (
            <FieldWrapper>
              <TokenInputField
                name="amount"
                // MUI
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
                disabled
                handleChange={handleChangeAmount as any}
              />
            </FieldWrapper>
          ) : (
            <>
              <FieldWrapper>
                <TokenInputField
                  name="amount"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <TokenAdornment
                        token={PODS}
                        onClick={showDialog}
                      />
                    ),
                  }}
                  // Other
                  balance={new BigNumber(farmerField.plots[values?.plotIndex])}
                  balanceLabel="Plot Size"
                  handleChange={handleChangeAmount as any}
                />
              </FieldWrapper>
              <FieldWrapper>
                <DoubleSliderField
                  balance={numPods}
                  sliderFields={['min', 'max']}
                />
              </FieldWrapper>
              <FieldWrapper label="Price Per Pod" tooltip={POD_MARKET_TOOLTIPS.pricePerPod}>
                <Field name="pricePerPod">
                  {(fieldProps: FieldProps) => (
                    // FIXME: delete InputField and use TokenInputField
                    <TokenInputField
                      {...fieldProps}
                      placeholder="0.0000"
                      balance={new BigNumber(1)}
                      balanceLabel="Maximum Price Per Pod"
                      InputProps={{
                        inputProps: { step: '0.01' },
                        endAdornment: (
                          <TokenAdornment
                            token={BEAN[1]}
                          />
                        )
                      }}
                    />
                  )}
                </Field>
              </FieldWrapper>
              <FieldWrapper label="Expires At" tooltip={POD_MARKET_TOOLTIPS.expiresAt}>
                <Field name="expiresAt">
                  {(fieldProps: FieldProps) => (
                    <TokenInputField
                      {...fieldProps}
                      placeholder="0.0000"
                      balanceLabel="Max Value"
                      balance={placeInLine.plus(values.min ? values.min : ZERO_BN)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Box sx={{ pr: 1 }}>
                              <Typography sx={{ fontSize: '18px' }}>Place in Line</Typography>
                            </Box>
                          </InputAdornment>)
                      }}
                    />
                  )}
                </Field>
              </FieldWrapper>
              <FieldWrapper label="Receive Beans to">
                <RadioCardField
                  name="option"
                  // Grid Props
                  spacing={1}
                  direction="row"
                  xs={12}
                  md={6}
                  options={[
                    {
                      title: 'Wallet',
                      description: 'Beans will be delivered directly to your wallet',
                      value: 0,
                    },
                    {
                      title: 'Farmable Balance',
                      description: 'Beans will be made Farmable within Beanstalk',
                      value: 1,
                    }
                  ]}
                  sx={{
                    width: '100%'
                  }}
                />
              </FieldWrapper>
              <Warning
                message="Pods in this Plot are already Listed on the Pod Market. Listing Pods from the same Plot will replace the previous Pod Listing." />
            </>
          )}

        <Button sx={{ p: 1, height: '60px' }} type="submit" disabled>
          Create Listing
        </Button>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const SellListing: React.FC<{}> = () => {
  const initialValues: SellListingFormValues = useMemo(() => ({
    option: null,
    min: ZERO_BN,
    max: null,
    amount: null,
    pricePerPod: null,
    expiresAt: null,
    plotIndex: null,
  }), []);

  // eslint-disable-next-line unused-imports/no-unused-vars
  const onSubmit = useCallback((values: SellListingFormValues, formActions: FormikHelpers<SellListingFormValues>) => {
    console.log('CARD: ', values.option);
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
