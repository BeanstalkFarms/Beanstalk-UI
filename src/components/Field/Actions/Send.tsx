import { Accordion, AccordionDetails, Box, Grid, Stack } from '@mui/material';
import AddressInputField from 'components/Common/Form/AddressInputField';
import FieldWrapper from 'components/Common/Form/FieldWrapper';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useEffect, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import useToggle from 'hooks/display/useToggle';
import { TokenAdornment, TokenInputField, TxnPreview } from 'components/Common/Form';
import { PODS } from 'constants/tokens';
import { LoadingButton } from '@mui/lab';
import { useAccount, useSigner } from 'wagmi';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated/index';
import TransactionToast from 'components/Common/TxnToast';
import SelectPlotDialog from '../SelectPlotDialog';
import { AppState } from '../../../state';
import { ZERO_BN } from '../../../constants';
import { displayFullBN, MaxBN, MinBN, toStringBaseUnitBN, trimAddress } from '../../../util';
import SliderField from '../../Common/Form/SliderField';
import Warning from '../../Common/Form/Warning';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';

export type SendFormValues = {
  to: string | null;
  plotIndex: string | null;
  start: BigNumber | null;
  end: BigNumber | null;
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

  const [dialogOpen, showDialog, hideDialog] = useToggle();

  const handlePlotSelect = useCallback((index: string) => {
    console.debug('[field/actions/Send]: selected plot', index);
    setFieldValue('plotIndex', index);
  }, [setFieldValue]);
  
  const reset = useCallback(() => {
    setFieldValue('start', new BigNumber(0));
    setFieldValue('end', numPods);
    setFieldValue('amount', numPods);
  }, [setFieldValue, numPods]);

  const handleChangeAmount = (amount: BigNumber | null) => {
    if (amount) {
      const delta = (values?.end || ZERO_BN).minus(amount);
      setFieldValue('start', MaxBN(ZERO_BN, delta));
      if (delta.lt(0)) {
        setFieldValue('end', MinBN(numPods, (values?.end || ZERO_BN).plus(delta.abs())));
      }
    }
  };

  useEffect(() => {
    if (values.plotIndex !== null) {
      console.debug('[field/actions/Send] Plot selected: ', values?.plotIndex);
      reset();
    }
  }, [values.plotIndex, reset]);

  useEffect(() => {
    setFieldValue('amount', values.end?.minus(values.start ? values.start : ZERO_BN));
  }, [values.start, values.end, setFieldValue]);

  const isReady = (
    values.plotIndex
    && values.to
    && values.start
    && values.amount?.gt(0)
    && isValid
  );

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
              placeholder="hide"
              disabled
              handleChange={handleChangeAmount}
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
                handleChange={handleChangeAmount}
              />
            </FieldWrapper>
            {/* <PlotDetails */}
            {/*  placeInLine={new BigNumber(values?.plotIndex).minus(beanstalkField?.harvestableIndex)} */}
            {/*  numPods={new BigNumber(farmerField.plots[values?.plotIndex])} */}
            {/*  onClick={showDialog} */}
            {/* /> */}
            <FieldWrapper>
              {/* <TokenInputField */}
              {/*  name="amount" */}
              {/*  token={PODS} */}
              {/*  placeholder="0.0000" */}
              {/*  balance={numPods || ZERO_BN} */}
              {/*  hideBalance */}
              {/*  InputProps={{ */}
              {/*    endAdornment: <TokenAdornment token={PODS} /> */}
              {/*  }} */}
              {/*  handleChange={handleChangeAmount} */}
              {/* /> */}
              <Box px={1}>
                <SliderField
                  min={0}
                  max={numPods.toNumber()}
                  fields={['start', 'end']}
                  initialState={[0, numPods.toNumber()]}
                  disabled={isSubmitting}
                />
              </Box>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TokenInputField
                    name="start"
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
                    name="end"
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
            </FieldWrapper>
            <FieldWrapper label="Recipient Address">
              <AddressInputField name="to" />
            </FieldWrapper>
            <Warning message="Pods can be exchanged in a decentralized fashion on the Pod Market. Send at your own risk." />
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BASE,
                        message: 'Do this.'
                      },
                      {
                        type: ActionType.BASE,
                        message: 'Then do this.'
                      }
                    ]}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
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
  const { data: account } = useAccount();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  
  // Form setup
  const initialValues: SendFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1, // 0.1%
    },
    to: null,
    plotIndex: null,
    start: null,
    end: null,
    amount: null,
  }), []);

  const onSubmit = useCallback(async (values: SendFormValues, formActions: FormikHelpers<SendFormValues>) => {
    if (!account?.address) throw new Error('Connect a wallet first.');
    const { to, plotIndex, start, end, amount } = values;
    if (!to || !plotIndex || !start || !end || !amount) throw new Error('Missing data.');
    const call = beanstalk.transferPlot(
      account.address,
      to.toString(),
      toStringBaseUnitBN(plotIndex, PODS.decimals),
      toStringBaseUnitBN(start, PODS.decimals),
      toStringBaseUnitBN(end, PODS.decimals),
    );
    // WORKING:
    // "737663715081254",
    // "0",
    // "57980000",
    // NOT WORKING
    // "737663715000000",
    // "0",
    // "57000000"

    const txToast = new TransactionToast({
      loading: `Sending ${displayFullBN(amount.abs(), PODS.decimals)} Pods to ${trimAddress(to)}.`,
      success: 'Plot sent.',
    });

    return call
      .then((txn) => {
        txToast.confirming(txn);
        return txn.wait();
      })
      .then((receipt) => {
        txToast.success(receipt);
        formActions.resetForm();
      })
      .catch((err) => {
        console.error(
          txToast.error(err.error || err),
        );
      });
  }, [
    account?.address,
    beanstalk
  ]);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}>
      {(formikProps: FormikProps<SendFormValues>) => (
        <SendForm
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Send;
