import { Box, Button, InputAdornment, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { ERC20Token, NativeToken } from 'classes/Token';
import { SettingInput, TokenAdornment, TokenInputField, TxnSettings } from 'components/Common/Form';
import { ZERO_BN } from 'constants/index';
import { BEAN, ETH, PODS } from 'constants/tokens';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useChainId from 'hooks/useChain';
import useChainConstant from 'hooks/useChainConstant';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { MaxBN, MinBN } from 'util/index';
import FieldWrapper from '../../Common/Form/FieldWrapper';
import SliderField from '../../Common/Form/SliderField';
import InputField from '../../Common/Form/InputField';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import podsIcon from '../../../img/beanstalk/pod-icon.svg';
import useToggle from '../../../hooks/display/useToggle';
import SelectPlotDialog from '../../Field/SelectPlotDialog';

export type SellNowFormValues = {
  plotIndex: string | null;
  min: BigNumber | null;
  max: BigNumber | null;
  amount: BigNumber | null;
}

const SellNowForm: React.FC<FormikProps<SellNowFormValues>
  & {
  token: ERC20Token | NativeToken;
}> = ({
        values,
        setFieldValue,
        //
        token: depositToken, // BEAN
      }) => {
  const [dialogOpen, showDialog, hideDialog] = useToggle();

  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );
  
  const numPods = values.plotIndex !== null ? new BigNumber(farmerField.plots[values.plotIndex]) : ZERO_BN;

  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

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
        {(values?.plotIndex === null) ? (
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
            <FieldWrapper label="Number of Pods to sell" tooltip={POD_MARKET_TOOLTIPS.amount}>
              <Field name="amount">
                {(fieldProps: FieldProps) => (
                  <InputField
                    {...fieldProps}
                    handleChangeOverride={handleChangeAmount}
                    maxValue={numPods}
                    minValue={new BigNumber(0)}
                    showMaxButton
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Stack direction="row" gap={0.3} alignItems="center" sx={{ pr: 1 }}>
                            <img src={podsIcon} alt="" height="30px" />
                            <Typography sx={{ fontSize: '20px' }}>PODS</Typography>
                          </Stack>
                        </InputAdornment>)
                    }}
                    // disabled
                  />
                )}
              </Field>
            </FieldWrapper>
            <Box px={3}>
              {/* double slider sets the form's 'min' and 'max' values */}
              {/* so we leave the name field blank */}
              <SliderField
                min={0}
                fields={['min', 'max']}
                max={numPods.toNumber()}
                initialState={[0, numPods.toNumber()]}
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
                        maxValue={values.max ? values.max.minus(1) : numPods.minus(1)}
                      />
                    )}
                  </Field>
                </FieldWrapper>
              </Box>
              <Box width="50%">
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
              </Box>
            </Stack>
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

const SellNow: React.FC<{}> = () => {
  const Eth = useChainConstant(ETH);

  const initialValues: SellNowFormValues = useMemo(() => ({
    tokens: [
      {
        token: Eth,
        amount: null,
      },
    ],
    plotIndex: null,
    min: ZERO_BN,
    max: null,
    amount: null
  }), [Eth]);

  const onSubmit = useCallback((values: SellNowFormValues, formActions: FormikHelpers<SellNowFormValues>) => {
    Promise.resolve();
  }, []);

  return (
    <Formik<SellNowFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<SellNowFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <SellNowForm
            token={BEAN[1]}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default SellNow;
