import { Box, Button, InputAdornment, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { ERC20Token, NativeToken } from 'classes/Token';
import { FormTokenState, SettingInput, TokenAdornment, TokenInputField, TxnSettings } from 'components/Common/Form';
import { ZERO_BN } from 'constants/index';
import { BEAN, ETH, PODS, WETH } from 'constants/tokens';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useChainConstant from 'hooks/useChainConstant';
import { PreferredToken } from 'hooks/usePreferredToken';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { MaxBN, MinBN } from 'util/index';
import FieldWrapper from '../../Common/Form/FieldWrapper';
import SliderField from '../../Common/Form/SliderField';
import InputField from '../../Common/Form/InputField';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import beanIcon from '../../../img/tokens/bean-logo-circled.svg';
import PlotDetails from '../Cards/PlotDetails';
import podsIcon from '../../../img/beanstalk/pod-icon.svg';
import RadioCardField from '../../Common/Form/RadioCardField';
import Warning from '../../Common/Form/Warning';
import useToggle from '../../../hooks/display/useToggle';
import SelectPlotDialog from '../../Field/SelectPlotDialog';

export type SellListingFormValues = {
  option: number | null;
  min: BigNumber;
  max: BigNumber | null;
  amount: BigNumber | null;
  pricePerPod: BigNumber | null;
  expiresAt: BigNumber | null;
  plotIndex: string | null;
}

const SellListingForm: React.FC<FormikProps<SellListingFormValues>
  & {
  // plot: any;
  // placeInLine: BigNumber;
  // numPods: BigNumber;
}> = ({
        values,
        // plot,
        // placeInLine,
        // numPods,
        setFieldValue,
      }) => {
  const [dialogOpen, showDialog, hideDialog] = useToggle();
  
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );

  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  // const numPods = new BigNumber(100);
  // const placeInLine = new BigNumber(100);
  const plot = values.plotIndex !== null ? farmerField.plots[values.plotIndex] : ZERO_BN;
  const placeInLine = values.plotIndex !== null ? new BigNumber(values.plotIndex).minus(beanstalkField?.harvestableIndex) : ZERO_BN;
  const numPods = values.plotIndex !== null ? new BigNumber(farmerField.plots[values.plotIndex]) : ZERO_BN;
  // plot={farmerField.plots[selectedPlotIndex]}
  // placeInLine={new BigNumber(selectedPlotIndex).minus(beanstalkField?.harvestableIndex)}
  // numPods={new BigNumber(farmerField.plots[selectedPlotIndex])}
  
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
        <pre>{JSON.stringify(values, null, 2)}</pre>
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
                      buttonLabel="SELECT PLOT"
                    />
                  ),
                }}
                // placeholder="hide"
                disabled
                handleChange={handleChangeAmount as any}
              />
            </FieldWrapper>
          ) : (
            <>
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
                      />
                    ),
                  }}
                  // Other
                  balance={new BigNumber(farmerField.plots[values?.plotIndex])}
                  balanceLabel="Plot Size"
                  handleChange={handleChangeAmount as any}
                />
              </FieldWrapper>
              <Box px={3}>
                {/* double slider sets the form's 'min' and 'max' values */}
                {/* so we leave the name field blank */}
                <SliderField
                  min={0}
                  fields={['min', 'max']}
                  max={numPods?.toNumber()}
                  initialState={[0, numPods?.toNumber()]}
                />
              </Box>
              <Stack direction="row" gap={1}>
                <Box width="50%">
                  <FieldWrapper label="Start" tooltip={POD_MARKET_TOOLTIPS.start}>
                    <Field name="min">
                      {(fieldProps: FieldProps) => (
                        <InputField
                          {...fieldProps}
                          placeholder="0.0000"
                          minValue={new BigNumber(0)}
                          maxValue={values.max ? values.max.minus(1) : numPods?.minus(1)}
                        />
                      )}
                    </Field>
                  </FieldWrapper>
                </Box>
                <Box width="50%">
                  <Stack gap={0.8}>
                    <FieldWrapper label="End" tooltip={POD_MARKET_TOOLTIPS.end}>
                      <Field name="max">
                        {(fieldProps: FieldProps) => (
                          <InputField
                            {...fieldProps}
                            placeholder="0.0000"
                            minValue={new BigNumber(0)}
                            maxValue={numPods}
                          />
                        )}
                      </Field>
                    </FieldWrapper>
                  </Stack>
                </Box>
              </Stack>
              {/*<FieldWrapper label="Amount" tooltip={POD_MARKET_TOOLTIPS.amount}>*/}
              {/*  <Field name="amount">*/}
              {/*    {(fieldProps: FieldProps) => (*/}
              {/*      <InputField*/}
              {/*        {...fieldProps}*/}
              {/*        handleChangeOverride={handleChangeAmount}*/}
              {/*        maxValue={numPods}*/}
              {/*        minValue={new BigNumber(0)}*/}
              {/*        InputProps={{*/}
              {/*          endAdornment: (*/}
              {/*            <InputAdornment position="end">*/}
              {/*              <Stack direction="row" gap={0.3} alignItems="center" sx={{ pr: 1 }}>*/}
              {/*                <img src={podsIcon} alt="" height="30px" />*/}
              {/*                <Typography sx={{ fontSize: '20px' }}>PODS</Typography>*/}
              {/*              </Stack>*/}
              {/*            </InputAdornment>)*/}
              {/*        }}*/}
              {/*        // disabled*/}
              {/*      />*/}
              {/*    )}*/}
              {/*  </Field>*/}
              {/*</FieldWrapper>*/}
              <FieldWrapper label="Price Per Pod" tooltip={POD_MARKET_TOOLTIPS.pricePerPod}>
                <Field name="pricePerPod">
                  {(fieldProps: FieldProps) => (
                    <InputField
                      {...fieldProps}
                      placeholder="0.0000"
                      showMaxButton
                      InputProps={{
                        inputProps: { step: '0.01' },
                        endAdornment: (
                          <InputAdornment position="end">
                            <Stack direction="row" gap={0.3} alignItems="center" sx={{ pr: 1 }}>
                              <img src={beanIcon} alt="" height="30px" />
                              <Typography sx={{ fontSize: '20px' }}>BEAN</Typography>
                            </Stack>
                          </InputAdornment>)
                      }}
                      maxValue={new BigNumber(1)}
                      minValue={new BigNumber(0)}
                    />
                  )}
                </Field>
              </FieldWrapper>
              <FieldWrapper label="Expires At" tooltip={POD_MARKET_TOOLTIPS.expiresAt}>
                <Field name="expiresAt">
                  {(fieldProps: FieldProps) => (
                    <InputField
                      {...fieldProps}
                      placeholder="0.0000"
                      showMaxButton
                      minValue={new BigNumber(0)}
                      maxValue={placeInLine.plus(values.min ? values.min : ZERO_BN)}
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

        <Button sx={{ p: 1 }} type="submit" disabled>
          Create Listing
        </Button>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const PREFERRED_TOKENS: PreferredToken[] = [
  {
    token: BEAN,
    minimum: new BigNumber(1),    // $1
  },
  {
    token: ETH,
    minimum: new BigNumber(0.001) // ~$2-4
  },
  {
    token: WETH,
    minimum: new BigNumber(0.001) // ~$2-4
  }
];

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
            // plot={farmerField.plots[selectedPlotIndex]}
            // placeInLine={new BigNumber(selectedPlotIndex).minus(beanstalkField?.harvestableIndex)}
            // numPods={new BigNumber(farmerField.plots[selectedPlotIndex])}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default SellListing;
