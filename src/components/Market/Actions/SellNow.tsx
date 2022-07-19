import { Accordion, AccordionDetails, Box, Button, Grid, Stack } from '@mui/material';
import BigNumber from 'bignumber.js';
import {
  SettingInput,
  TokenAdornment,
  TokenInputField,
  TokenOutputField, TxnPreview,
  TxnSeparator,
  TxnSettings
} from 'components/Common/Form';
import { ZERO_BN } from 'constants/index';
import { BEAN, ETH, PODS } from 'constants/tokens';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useChainConstant from 'hooks/useChainConstant';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { MaxBN, MinBN } from 'util/index';
import FieldWrapper from '../../Common/Form/FieldWrapper';
import SliderField from '../../Common/Form/SliderField';
import useToggle from '../../../hooks/display/useToggle';
import SelectPlotDialog from '../../Field/SelectPlotDialog';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';
import { PodOrder } from '../Plots.mock';

export type SellNowFormValues = {
  plotIndex: string | null;
  min: BigNumber | null;
  max: BigNumber | null;
  amount: BigNumber | null;
}

const SellNowForm: React.FC<FormikProps<SellNowFormValues>
  & {
    podOrder: PodOrder;
  }
> = ({
  values,
  setFieldValue,
  podOrder,
}) => {
  const [dialogOpen, showDialog, hideDialog] = useToggle();

  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );
  
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  const numPods = useMemo(() => (values.plotIndex !== null ? new BigNumber(farmerField.plots[values.plotIndex]) : ZERO_BN), [farmerField.plots, values.plotIndex]);
  
  const handlePlotSelect = useCallback((index: string) => {
    setFieldValue('plotIndex', index);
    setFieldValue('min', ZERO_BN);
    setFieldValue('max', new BigNumber(farmerField.plots[index]));
    setFieldValue('amount', new BigNumber(farmerField.plots[index]));
  }, [farmerField.plots, setFieldValue]);

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
      {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
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
                    buttonLabel="Select Plot"
                  />
                ),
              }}
              disabled
            />
          </FieldWrapper>
        ) : (
          <Stack gap={1}>
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
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TokenInputField
                  name="min"
                  token={PODS}
                  placeholder="0.0000"
                  balance={numPods || ZERO_BN}
                  hideBalance
                  InputProps={{
                    endAdornment: 'Start'
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
                    endAdornment: 'End'
                  }}
                  size="small"
                />
              </Grid>
            </Grid>
            <TxnSeparator mt={0} />
            <TokenOutputField
              token={BEAN[1]}
              amount={podOrder.pricePerPod.multipliedBy(values.amount ? values.amount : ZERO_BN)}
              isLoading={false}
            />
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BASE,
                        message: 'DO SOMETHING'
                      },
                      {
                        type: ActionType.BASE,
                        message: 'DO SOMETHING!'
                      }
                    ]}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </Stack>
        )}
        <Button sx={{ p: 1, height: '60px' }} type="submit" disabled>
          Create Listing
        </Button>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const SellNow: React.FC<{ podOrder: PodOrder}> = ({ podOrder }) => {
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

  // eslint-disable-next-line unused-imports/no-unused-vars
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
            podOrder={podOrder}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default SellNow;
