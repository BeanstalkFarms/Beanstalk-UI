import { Accordion, AccordionDetails, Box, Button, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import {
  TokenAdornment,
  TokenInputField,
  TokenOutputField, TxnPreview,
  TxnSeparator
} from 'components/Common/Form';
import { ZERO_BN } from 'constants/index';
import { BEAN, ETH, PODS } from 'constants/tokens';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useChainConstant from 'hooks/useChainConstant';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayBN, MaxBN, MinBN } from 'util/index';
import AdvancedButton from 'components/Common/Form/AdvancedButton';
import DoubleSliderField from 'components/Common/Form/DoubleSliderField';
import FieldWrapper from '../../Common/Form/FieldWrapper';
import useToggle from '../../../hooks/display/useToggle';
import SelectPlotDialog from '../../Field/SelectPlotDialog';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';
import { PodOrder } from '../Plots.mock';

export type FillOrderFormValues = {
  plot: {
    index:  string | null;
    start:  BigNumber | null;
    end:    BigNumber | null;
    amount: BigNumber | null;
  }
  settings: {
    showRangeSelect: boolean;
  }
}

const SLIDER_FIELD_KEYS = ['start', 'end'];

const FillOrderForm: React.FC<FormikProps<FillOrderFormValues>
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
    setFieldValue('start', ZERO_BN);
    setFieldValue('end', new BigNumber(farmerField.plots[index]));
    setFieldValue('amount', new BigNumber(farmerField.plots[index]));
  }, [farmerField.plots, setFieldValue]);

  const handleChangeAmount = (amount: BigNumber | undefined) => {
    if (!amount) {
      /// If the user clears the amount input, set default value
      setFieldValue('start', numPods);
      setFieldValue('end', numPods);
    } else {
      /// Expand the plot plot range assuming that the right handle is fixed:
      ///
      /// plot                              start     end     amount    next action
      /// -----------------------------------------------------------------------------------
      /// 0 [     |---------|     ] 1000    300       600     300       increase amount by 150
      /// 0 [  |------------|     ] 1000    150       600     450       increase amount by 300
      /// 0 [------------------|  ] 1000    0         750     750       increase amount by 150
      /// 0 [---------------------] 1000    0         1000    1000      reached maximum amount
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
        selected={values.plotIndex}
        open={dialogOpen}
      />
      <Stack gap={1}>
        {(!values?.plotIndex) ? (
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
                      buttonLabel={(
                        <Stack direction="row" alignItems="center" gap={0.75}>
                          <Typography display="inline" fontSize={16}>@</Typography>
                          {displayBN(new BigNumber(values.plotIndex))}
                        </Stack>
                      )}
                    />
                  ),
                }}
                // Other
                balance={farmerField.plots[values.plotIndex]}
                balanceLabel="Plot Size"
                handleChange={handleChangeAmount}
                quote={(
                  <AdvancedButton
                    open={values.settings.showRangeSelect}
                    onClick={() => setFieldValue(
                      'settings.showRangeSelect',
                      !values.settings.showRangeSelect
                    )}
                  />
                )}
              />
            </FieldWrapper>
            {values.settings.showRangeSelect && (
              <FieldWrapper>
                <DoubleSliderField
                  balance={numPods}
                  sliderFields={SLIDER_FIELD_KEYS}
                />
              </FieldWrapper>
            )}
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

const FillOrder: React.FC<{ podOrder: PodOrder}> = ({ podOrder }) => {
  const Eth = useChainConstant(ETH);

  const initialValues: FillOrderFormValues = useMemo(() => ({
    ///
    tokens: [
      {
        token: Eth,
        amount: null,
      },
    ],
    ///
    plotIndex: null,
    start: ZERO_BN,
    end: null,
    amount: null,
    ///
    settings: {
      showRangeSelect: false,
    }
  }), [Eth]);

  // eslint-disable-next-line unused-imports/no-unused-vars
  const onSubmit = useCallback((values: FillOrderFormValues, formActions: FormikHelpers<FillOrderFormValues>) => {
    Promise.resolve();
  }, []);

  return (
    <Formik<FillOrderFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<FillOrderFormValues>) => (
        <>
          <FillOrderForm
            podOrder={podOrder}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default FillOrder;
