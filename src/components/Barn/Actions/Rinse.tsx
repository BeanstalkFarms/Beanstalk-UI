import React, { useCallback, useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import BigNumber from 'bignumber.js';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import toast from 'react-hot-toast';
import {
  SmartSubmitButton,
  TokenAdornment,
  TokenInputField,
  TokenOutputField,
  TxnSeparator
} from '~/components/Common/Form';
import TxnPreview from '~/components/Common/Form/TxnPreview';
import TxnAccordion from '~/components/Common/TxnAccordion';
import FarmModeField from '~/components/Common/Form/FarmModeField';
import TransactionToast from '~/components/Common/TxnToast';
import useFarmerFertilizer from '~/hooks/redux/useFarmerFertilizer';
import { useBeanstalkContract } from '~/hooks/useContract';
import { useSigner } from '~/hooks/ledger/useSigner';
import useAccount from '~/hooks/ledger/useAccount';
import { FarmToMode } from '~/lib/Beanstalk/Farm';
import { displayFullBN, parseError } from '~/util';
import { useFetchFarmerBarn } from '~/state/farmer/barn/updater';
import { ZERO_BN } from '~/constants';
import { BEAN, SPROUTS } from '~/constants/tokens';
import { useFetchFarmerBalances } from '~/state/farmer/balances/updater';
import { ActionType } from '~/util/Actions';
import copy from '~/constants/copy';

// ---------------------------------------------------

type RinseFormValues = {
  destination: FarmToMode | undefined;
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
  const isSubmittable = (
    amountSprouts?.gt(0)
    && values.destination !== undefined
  );

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
          <FarmModeField
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
          disabled={!isSubmittable}
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
  const farmerBarn          = useFarmerFertilizer();
  const [refetchFarmerBarn] = useFetchFarmerBarn();
  const [refetchBalances]   = useFetchFarmerBalances();
  
  /// Contracts
  const beanstalk = useBeanstalkContract(signer);

  const initialValues : RinseFormValues = useMemo(() => ({
    destination: undefined,
    amount: farmerBarn.fertilizedSprouts,
  }), [farmerBarn.fertilizedSprouts]);

  const onSubmit = useCallback(async (values: RinseFormValues, formActions: FormikHelpers<RinseFormValues>) => {
    let txToast;
    try {
      if (!farmerBarn.fertilizedSprouts) throw new Error('No Sprouts to Rinse.');
      if (!values.destination) throw new Error('No destination set.');
      if (!account) throw new Error('Connect a wallet first.');

      txToast = new TransactionToast({
        loading: `Rinsing ${displayFullBN(farmerBarn.fertilizedSprouts, SPROUTS.displayDecimals)} Sprouts...`,
        success: `Rinse successful. Added ${displayFullBN(farmerBarn.fertilizedSprouts, SPROUTS.displayDecimals)} Beans to your ${copy.MODES[values.destination]}.`,
      });

      const txn = await beanstalk.claimFertilized(
        farmerBarn.balances.map((bal) => bal.token.id.toString()),
        values.destination
      );
      txToast.confirming(txn);

      const receipt = await txn.wait();
      await Promise.all([
        refetchFarmerBarn(),
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
    farmerBarn?.balances,
    farmerBarn?.fertilizedSprouts,
    refetchFarmerBarn,
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
