import React, { useCallback, useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useSigner } from 'hooks/ledger/useSigner';
import { BEAN, SPROUTS } from '~/constants/tokens';
import { ZERO_BN } from '~/constants/index';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { useBeanstalkContract } from 'hooks/useContract';
import {
  SmartSubmitButton,
  TokenAdornment,
  TokenInputField,
  TokenOutputField,
  TxnSeparator
} from 'components/Common/Form';
import TxnPreview from 'components/Common/Form/TxnPreview';
import TxnAccordion from 'components/Common/TxnAccordion';
import { useFetchFarmerBarn } from '~/state/farmer/barn/updater';
import { displayFullBN, parseError } from 'util/index';
import { BeanstalkReplanted } from 'generated';
import { FarmToMode } from '~/lib/Beanstalk/Farm';
import DestinationField from 'components/Common/Form/DestinationField';
import useFarmerFertilizer from 'hooks/redux/useFarmerFertilizer';
import TransactionToast from 'components/Common/TxnToast';
import toast from 'react-hot-toast';
import useAccount from 'hooks/ledger/useAccount';
import { useFetchFarmerBalances } from '~/state/farmer/balances/updater';
import { ActionType } from 'util/Actions';
import copy from '~/constants/copy';

// ---------------------------------------------------

type RinseFormValues = {
  destination: FarmToMode;
  amount: BigNumber;
};

// ---------------------------------------------------

const RinseForm : React.FC<
  FormikProps<RinseFormValues>
> = ({
  values,
  isSubmitting,
}) => {
  /// Extract
  const amountSprouts = values.amount;
  const isValid = amountSprouts?.gt(0);

  return (
    <Form autoComplete="off" noValidate>
      <Stack gap={1}>
        {/* Form Contents */}
        <Stack gap={1}>
          {/* Inputs */}
          <TokenInputField
            token={SPROUTS}
            balanceLabel="Rinsable Balance"
            balance={amountSprouts || ZERO_BN}
            name="amount"
            disabled
            // MUI
            fullWidth
            InputProps={{
              endAdornment: (
                <TokenAdornment
                  token={SPROUTS}
                />
              )
            }}
          />
          <DestinationField
            name="destination"
          />
          {/* Outputs */}
          {amountSprouts?.gt(0) ? (
            <>
              <TxnSeparator />
              <TokenOutputField
                token={BEAN[1]}
                amount={amountSprouts}
              />
              <Box sx={{ width: '100%', mt: 0 }}>
                <TxnAccordion defaultExpanded={false}>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.RINSE,
                        amount: amountSprouts,
                      },
                      {
                        type: ActionType.RECEIVE_BEANS,
                        amount: amountSprouts,
                        destination: values.destination,
                      },
                    ]}
                  />
                </TxnAccordion>
              </Box>
            </>
          ) : null}
        </Stack>
        {/* Submit */}
        <SmartSubmitButton
          loading={isSubmitting}
          disabled={!isValid}
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          tokens={[]}
          mode="auto"
        >
          Rinse
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const Rinse : React.FC<{}> = () => {
  /// Wallet connection
  const account = useAccount();
  const { data: signer } = useSigner();
  
  /// Farmer data
  const farmerFertilizer    = useFarmerFertilizer();
  const [refetchFertilizer] = useFetchFarmerBarn();
  const [refetchBalances]   = useFetchFarmerBalances();
  
  /// Contracts
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;

  const initialValues : RinseFormValues = useMemo(() => ({
    destination: FarmToMode.INTERNAL,
    amount: farmerFertilizer.fertilizedSprouts,
  }), [farmerFertilizer.fertilizedSprouts]);

  const onSubmit = useCallback(async (values: RinseFormValues, formActions: FormikHelpers<RinseFormValues>) => {
    let txToast;
    try {
      if (!farmerFertilizer.fertilizedSprouts) throw new Error('No Sprouts to Rinse.');
      if (!values.destination) throw new Error('No destination set.');
      if (!account) throw new Error('Connect a wallet first.');

      txToast = new TransactionToast({
        loading: `Rinsing ${displayFullBN(farmerFertilizer.fertilizedSprouts, SPROUTS.displayDecimals)} Sprouts...`,
        success: `Rinse successful. Added ${displayFullBN(farmerFertilizer.fertilizedSprouts, SPROUTS.displayDecimals)} Beans to your ${copy.TO_MODE[values.destination]}.`,
      });

      const txn = await beanstalk.claimFertilized(
        Object.keys(farmerFertilizer.fertilizer),
        values.destination
      );
      txToast.confirming(txn);

      const receipt = await txn.wait();
      await Promise.all([
        refetchFertilizer(),
        refetchBalances()
      ]);
      txToast.success(receipt);
      formActions.resetForm({
        values: {
          destination: FarmToMode.INTERNAL,
          amount: ZERO_BN,
        }
      });
    } catch (err) {
      txToast ? txToast.error(err) : toast.error(parseError(err));
    }
  }, [
    beanstalk,
    account,
    farmerFertilizer?.fertilizer,
    farmerFertilizer?.fertilizedSprouts,
    refetchFertilizer,
    refetchBalances,
  ]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize>
      {(formikProps) => (
        <RinseForm
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Rinse;
