import { Accordion, AccordionDetails, Box, Stack } from '@mui/material';
import AddressInputField from 'components/Common/Form/AddressInputField';
import FieldWrapper from 'components/Common/Form/FieldWrapper';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PlotFragment, PlotSettingsFragment, TxnPreview, TxnSeparator } from 'components/Common/Form';
import { PODS } from 'constants/tokens';
import { LoadingButton } from '@mui/lab';
import { useSigner } from 'hooks/ledger/useSigner';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated/index';
import TransactionToast from 'components/Common/TxnToast';
import useAccount from 'hooks/ledger/useAccount';
import PlotInputField from 'components/Common/Form/PlotInputField';
import { AppState } from '../../../state';
import { ZERO_BN } from '../../../constants';
import { displayFullBN, toStringBaseUnitBN, trimAddress } from '../../../util';
import Warning from '../../Common/Form/Warning';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';

export type SendFormValues = {
  plot: PlotFragment;
  to: string | null;
  // plotIndex: string | null;
  // start: BigNumber | null;
  // end: BigNumber | null;
  // amount: BigNumber | null;
  settings: PlotSettingsFragment & {
    slippage: number, // 0.1%
  }
}

export interface SendFormProps {}

const SliderFieldKeys = ['start', 'end'];

const SendForm: React.FC<
  SendFormProps &
  FormikProps<SendFormValues>
> = ({
  values,
  isValid,
  isSubmitting,
  setFieldValue
}) => {
  const account = useAccount();
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );

  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  // const numPods = useMemo(() =>
  //     (values?.plotIndex
  //       ? farmerField.plots[values.plotIndex]
  //       : ZERO_BN),
  //   [farmerField.plots, values?.plotIndex]
  // );

  // const [dialogOpen, showDialog, hideDialog] = useToggle();

  // const handlePlotSelect = useCallback((index: string) => {
  //   console.debug('[field/actions/Send]: selected plot', index);
  //   setFieldValue('plotIndex', index);
  // }, [setFieldValue]);

  // const reset = useCallback(() => {
  //   setFieldValue('start', new BigNumber(0));
  //   setFieldValue('end', numPods);
  //   setFieldValue('amount', numPods);
  // }, [setFieldValue, numPods]);

  // const handleChangeAmount = (amount: BigNumber | undefined) => {
  //   if (amount) {
  //     const delta = (values?.end || ZERO_BN).minus(amount);
  //     setFieldValue('start', MaxBN(ZERO_BN, delta));
  //     if (delta.lt(0)) {
  //       setFieldValue('end', MinBN(numPods, (values?.end || ZERO_BN).plus(delta.abs())));
  //     }
  //   }
  // };

  // useEffect(() => {
  //   if (values.plotIndex !== null) {
  //     console.debug('[field/actions/Send] Plot selected: ', values?.plotIndex);
  //     reset();
  //   }
  // }, [values.plotIndex, reset]);

  // useEffect(() => {
  //   setFieldValue('amount', values.end?.minus(values.start ? values.start : ZERO_BN));
  // }, [values.start, values.end, setFieldValue]);

  const plot = values.plot;
  const isReady = (
    plot.index
    && values.to
    && plot.start
    && plot.amount?.gt(0)
    && isValid
  );

  return (
    <Form autoComplete="off">
      {/* <SelectPlotDialog
        farmerField={farmerField}
        beanstalkField={beanstalkField}
        handlePlotSelect={handlePlotSelect}
        handleClose={hideDialog}
        selected={values.plotIndex}
        open={dialogOpen}
      /> */}
      <Stack gap={1}>
        <PlotInputField />
        {plot.index && (
          <>
            <TxnSeparator />
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
                        type:    ActionType.SEND_PODS,
                        start:   plot.start ? plot.start : ZERO_BN,
                        end:     plot.end ? plot.end : ZERO_BN,
                        address: values.to !== null ? values.to : ''
                      },
                      {
                        type: ActionType.END_TOKEN,
                        token: PODS
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
  const account = useAccount();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;

  // Form setup
  const initialValues: SendFormValues = useMemo(() => ({
    plot: {
      index: null,
      start: null,
      end: null,
      amount: null,
    },
    to: null,
    settings: {
      slippage: 0.1, // 0.1%
      showRangeSelect: false,
    },
  }), []);

  const onSubmit = useCallback(async (values: SendFormValues, formActions: FormikHelpers<SendFormValues>) => {
    if (!account) throw new Error('Connect a wallet first.');
    const { to, plot: { index, start, end, amount } } = values;
    if (!to || !index || !start || !end || !amount) throw new Error('Missing data.');

    const call = beanstalk.transferPlot(
      account,
      to.toString(),
      toStringBaseUnitBN(index, PODS.decimals),
      toStringBaseUnitBN(start, PODS.decimals),
      toStringBaseUnitBN(end,   PODS.decimals),
    );

    const txToast = new TransactionToast({
      loading: `Sending ${displayFullBN(amount.abs(), PODS.decimals)} Pods to ${trimAddress(to)}.`,
      success: 'Plot sent.',
    });

    /// TODO: refresh field
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
    account,
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
