import { Accordion, AccordionDetails, Alert, Box, Stack } from '@mui/material';
import AddressInputField from 'components/Common/Form/AddressInputField';
import FieldWrapper from 'components/Common/Form/FieldWrapper';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';
import { PlotFragment, PlotSettingsFragment, SmartSubmitButton, TxnPreview, TxnSeparator } from 'components/Common/Form';
import { PODS } from 'constants/tokens';
import { useSigner } from 'hooks/ledger/useSigner';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated/index';
import TransactionToast from 'components/Common/TxnToast';
import useAccount from 'hooks/ledger/useAccount';
import PlotInputField from 'components/Common/Form/PlotInputField';
import useFarmerPlots from 'hooks/redux/useFarmerPlots';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ZERO_BN } from '../../../constants';
import { displayFullBN, toStringBaseUnitBN, trimAddress } from '../../../util';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';
import { IconSize } from '../../App/muiTheme';
import IconWrapper from '../../Common/IconWrapper';

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
            <Box>
              <Alert
                color="warning"
                icon={<IconWrapper boxSize={IconSize.medium}><WarningAmberIcon sx={{ fontSize: IconSize.small }} /></IconWrapper>}
              >
                Pods can be exchanged in a decentralized fashion on the Pod Market. Send at your own risk.
              </Alert>
            </Box>
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type:    ActionType.SEND_PODS,
                        amount:  plot.amount || ZERO_BN,
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
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;

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
      {(formikProps: FormikProps<TransferFormValues>) => (
        <TransferForm
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Transfer;
