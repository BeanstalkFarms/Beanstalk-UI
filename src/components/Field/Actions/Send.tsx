import { Accordion, AccordionDetails, Box, Stack } from '@mui/material';
import AddressInputField from 'components/Common/Form/AddressInputField';
import FieldWrapper from 'components/Common/Form/FieldWrapper';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';
import { PlotFragment, PlotSettingsFragment, TxnPreview, TxnSeparator } from 'components/Common/Form';
import { PODS } from 'constants/tokens';
import { LoadingButton } from '@mui/lab';
import { useSigner } from 'hooks/ledger/useSigner';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated/index';
import TransactionToast from 'components/Common/TxnToast';
import useAccount from 'hooks/ledger/useAccount';
import PlotInputField from 'components/Common/Form/PlotInputField';
import Warning from 'components/Common/Form/Warning';
import useFarmerPlots from 'hooks/redux/useFarmerPlots';
import { displayFullBN, toStringBaseUnitBN, trimAddress } from '../../../util';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';

export type SendFormValues = {
  plot: PlotFragment;
  to: string | null;
  settings: PlotSettingsFragment & {
    slippage: number, // 0.1%
  }
}

export interface SendFormProps {}

const SendForm: React.FC<
  SendFormProps &
  FormikProps<SendFormValues>
> = ({
  values,
  isValid,
  isSubmitting,
}) => {
  /// Data
  const plots = useFarmerPlots();

  /// Form Data
  const plot = values.plot;

  /// Derived
  const isReady = (
    plot.index
    && values.to
    && plot.start
    && plot.amount?.gt(0)
    && isValid
  );

  return (
    <Form autoComplete="off">
      <Stack gap={1}>
        <PlotInputField
          plots={plots}
        />
        {plot.index && (
          <>
            <TxnSeparator />
            <FieldWrapper label="Recipient Address">
              <AddressInputField name="to" />
            </FieldWrapper>
            {isReady ? (
              <>
                <Warning message="Pods can be exchanged in a decentralized fashion on the Pod Market. Send at your own risk." />
                <Box>
                  <Accordion variant="outlined">
                    <StyledAccordionSummary title="Transaction Details" />
                    <AccordionDetails>
                      <TxnPreview
                        actions={[
                          {
                            type:    ActionType.SEND_PODS,
                            amount:  plot.amount!,
                            // start:   plot.start ? plot.start : ZERO_BN,
                            // end:     plot.end ? plot.end : ZERO_BN,
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
            ) : null}
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
