import { Accordion, AccordionDetails, Box, Stack } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import AddressInputField from '~/components/Common/Form/AddressInputField';
import FieldWrapper from '~/components/Common/Form/FieldWrapper';
import { PlotFragment, PlotSettingsFragment, SmartSubmitButton, TokenOutputField, TxnPreview, TxnSeparator } from '~/components/Common/Form';
import TransactionToast from '~/components/Common/TxnToast';
import PlotInputField from '~/components/Common/Form/PlotInputField';
import { useSigner } from '~/hooks/ledger/useSigner';
import { useBeanstalkContract } from '~/hooks/useContract';
import useAccount from '~/hooks/ledger/useAccount';
import useFarmerPlots from '~/hooks/redux/useFarmerPlots';
import useHarvestableIndex from '~/hooks/redux/useHarvestableIndex';
import { PODS } from '~/constants/tokens';
import { ZERO_BN } from '../../../constants';
import { displayFullBN, toStringBaseUnitBN, trimAddress } from '../../../util';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';

export type TransferFormValues = {
  plot: PlotFragment;
  to: string | null;
  settings: PlotSettingsFragment & {
    slippage: number, // 0.1%
  }
}

export interface SendFormProps {}

const TransferForm: React.FC<
  SendFormProps &
  FormikProps<TransferFormValues>
> = ({
  values,
  isValid,
  isSubmitting,
}) => {
  /// Data
  const plots = useFarmerPlots();
  const harvestableIndex = useHarvestableIndex();

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
          <FieldWrapper label="Transfer to">
            <AddressInputField name="to" />
          </FieldWrapper>
        )}
        {(values.to && plot.amount && plot.start && plot.index) && (
          <>
            <TxnSeparator />
            <TokenOutputField
              amount={plot.amount.negated()}
              token={PODS}
            />
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type:    ActionType.TRANSFER_PODS,
                        amount:  plot.amount || ZERO_BN,
                        address: values.to !== null ? values.to : '',
                        placeInLine: new BigNumber(plot.index).minus(harvestableIndex).plus(plot.start)
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
        <SmartSubmitButton
          loading={isSubmitting}
          disabled={!isReady || isSubmitting}
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          tokens={[]}
          mode="auto"
        >
          Transfer
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

const Transfer: React.FC<{}> = () => {
  const account = useAccount();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);

  // Form setup
  const initialValues: TransferFormValues = useMemo(() => ({
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

  const onSubmit = useCallback(async (values: TransferFormValues, formActions: FormikHelpers<TransferFormValues>) => {
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
      loading: `Transferring ${displayFullBN(amount.abs(), PODS.decimals)} Pods to ${trimAddress(to)}.`,
      success: 'Plot Transferred.',
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
      {(formikProps: FormikProps<TransferFormValues>) => (
        <TransferForm
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Transfer;
