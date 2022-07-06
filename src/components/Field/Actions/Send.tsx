import { Box, Button, Grid, InputAdornment, Stack, Tooltip, Typography } from '@mui/material';
import AddressInputField from 'components/Common/Form/AddressInputField';
import FieldWrapper from 'components/Common/Form/FieldWrapper';
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import DropdownField from '../../Common/Form/DropdownField';
import SelectPlotDialog from '../SelectPlotDialog';
import PlotDetails from '../../Market/Cards/PlotDetails';
import { AppState } from '../../../state';
import { ZERO_BN } from '../../../constants';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import InputField from '../../Common/Form/InputField';
import podsIcon from '../../../img/beanstalk/pod-icon.svg';
import { MaxBN, MinBN } from '../../../util';
import SliderField from '../../Common/Form/SliderField';
import Warning from "../../Common/Form/Warning";
import useToggle from 'hooks/display/useToggle';
import { TokenAdornment, TokenInputField } from 'components/Common/Form';
import { PODS } from 'constants/tokens';
import { LoadingButton } from '@mui/lab';

export type SendFormValues = {
  to: string | null;
  plotIndex: string | null;
  min: BigNumber | null;
  max: BigNumber | null;
  amount: BigNumber | null;
}

export interface SendFormProps {}

const SendForm: React.FC<
  SendFormProps & 
  FormikProps<SendFormValues>
> = ({
  values,
  isValid,
  isSubmitting,
  setFieldValue
}) => {
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );

  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  const numPods = useMemo(() => 
    (values?.plotIndex 
      ? farmerField.plots[values.plotIndex]
      : ZERO_BN),
    [farmerField.plots, values?.plotIndex]
  );

  const [dialogOpen, showDialog, hideDialog] = useToggle()

  const handlePlotSelect = useCallback((index: string) => {
    setFieldValue('plotIndex', index);
  }, [setFieldValue])
  
  const reset = useCallback(() => {
    setFieldValue('min', new BigNumber(0));
    setFieldValue('max', numPods);
    setFieldValue('amount', numPods);
  }, [setFieldValue, numPods]);

  const handleChangeAmount = (amount: BigNumber | null) => {
    if (amount) {
      const delta = (values?.max || ZERO_BN).minus(amount);
      setFieldValue('min', MaxBN(ZERO_BN, delta));
      if (delta.lt(0)) {
        setFieldValue('max', MinBN(numPods, (values?.max || ZERO_BN).plus(delta.abs())));
      }
    }
  };

  useEffect(() => {
    if (values.plotIndex !== null) {
      console.debug('[field/actions/Send] Plot selected: ', values?.plotIndex);
      reset();
    }
  }, [values.plotIndex, reset]);

  const isReady = (
    values.plotIndex
    && values.to
    && values.min
    && values.amount
    && isValid
  )

  return (
    <Form autoComplete="off">
      <SelectPlotDialog
        farmerField={farmerField}
        beanstalkField={beanstalkField}
        handlePlotSelect={handlePlotSelect}
        handleClose={hideDialog}
        open={dialogOpen}
      />
      <Stack gap={1}>
        {(values?.plotIndex === null) ? (
          <DropdownField buttonText="Select a Plot" handleOpenDialog={showDialog} />
        ) : (
          <>
            <PlotDetails
              placeInLine={new BigNumber(values?.plotIndex).minus(beanstalkField?.harvestableIndex)}
              numPods={new BigNumber(farmerField.plots[values?.plotIndex])}
              onClick={showDialog}
            />
            <FieldWrapper label="Recipient Address">
              <AddressInputField name="to" />
            </FieldWrapper>
            <FieldWrapper label="Pods" tooltip={POD_MARKET_TOOLTIPS.amount}>
              <Box px={1}>
                <SliderField
                  min={0}
                  fields={['min', 'max']}
                  max={numPods.toNumber()}
                  initialState={[0, numPods.toNumber()]}
                  disabled={isSubmitting}
                />
              </Box>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TokenInputField
                    name="min"
                    token={PODS}
                    placeholder="0.0000"
                    balance={numPods || ZERO_BN}
                    hideBalance
                    InputProps={{
                      endAdornment: "Start"
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TokenInputField
                    name="max"
                    token={PODS}
                    placeholder="0.0000"
                    balance={numPods || ZERO_BN}
                    hideBalance
                    InputProps={{
                      endAdornment: "End"
                    }}
                    size="small"
                  />
                </Grid>
              </Grid>
              <TokenInputField
                name="amount"
                token={PODS}
                placeholder="0.0000"
                balance={numPods || ZERO_BN}
                hideBalance
                InputProps={{
                  endAdornment: <TokenAdornment token={PODS} />
                }}
                handleChange={handleChangeAmount}
              />
            </FieldWrapper>
            <Warning message="Pods can be exchanged in a decentralized fashion on the Pod Market. Send at your own risk." />
          </>
        )}
        <LoadingButton
          loading={isSubmitting}
          disabled={!isReady || isSubmitting}
          fullWidth
          type="submit"
          variant="contained"
          size="large">
          Send
        </LoadingButton>
      </Stack>
    </Form>
  );
};

const Send: React.FC<{}> = () => {
  // Form setup
  const initialValues: SendFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1, // 0.1%
    },
    to: null,
    plotIndex: null,
    min: null,
    max: null,
    // max: selectedPlotIndex ? new BigNumber(farmerField.plots[selectedPlotIndex]) : ZERO_BN,
    amount: null,
    // amount: selectedPlotIndex ? new BigNumber(farmerField.plots[selectedPlotIndex]) : ZERO_BN,
  }), []);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={() => {
      }}>
      {(formikProps: FormikProps<SendFormValues>) => (
        <SendForm
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Send;
