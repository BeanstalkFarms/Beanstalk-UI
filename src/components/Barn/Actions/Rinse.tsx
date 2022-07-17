import React, { useCallback, useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useSigner } from 'hooks/ledger/useSigner';
import { BEAN, FERTILIZED_SPROUTS } from 'constants/tokens';
import { ZERO_BN } from 'constants/index';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { useBeanstalkContract } from 'hooks/useContract';
import { TokenAdornment, TokenInputField, TokenOutputField, TxnSeparator } from 'components/Common/Form';
import TxnPreview from 'components/Common/Form/TxnPreview';
import TxnAccordion from 'components/Common/TxnAccordion';
import { useFetchFarmerBarn } from 'state/farmer/barn/updater';
import { displayBN, displayFullBN, parseError } from 'util/index';
import { BeanstalkReplanted } from 'generated';
import { FarmToMode } from 'lib/Beanstalk/Farm';
import { LoadingButton } from '@mui/lab';
import DestinationField from 'components/Field/DestinationField';
import useFarmerFertilizer from 'hooks/redux/useFarmerFertilizer';
import TransactionToast from 'components/Common/TxnToast';
import toast from 'react-hot-toast';
import useAccount from 'hooks/ledger/useAccount';

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
    <Form noValidate>
      <Stack gap={1}>
        {/* Form Contents */}
        <Stack gap={1}>
          {/* Inputs */}
          <TokenInputField
            token={FERTILIZED_SPROUTS}
            balanceLabel="Fertilized Sprout Balance"
            balance={amountSprouts || ZERO_BN}
            name="amount"
            disabled
            // MUI
            fullWidth
            InputProps={{
              endAdornment: (
                <TokenAdornment
                  token={FERTILIZED_SPROUTS}
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
                    actions={[]}
                  />
                </TxnAccordion>
              </Box>
            </>
          ) : null}
        </Stack>
        {/* Submit */}
        <LoadingButton
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          loading={isSubmitting}
          disabled={!isValid}
        >
          Rinse{amountSprouts && amountSprouts.gt(0) && ` ${displayBN(amountSprouts)}`} Sprouts
        </LoadingButton>
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
  
  /// Contracts
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;

  const initialValues : RinseFormValues = useMemo(() => ({
    destination: FarmToMode.INTERNAL,
    amount: farmerFertilizer.fertilizedSprouts,
  }), [farmerFertilizer.fertilizedSprouts]);

  const onSubmit = useCallback(async (values: RinseFormValues, formActions: FormikHelpers<RinseFormValues>) => {
    let txToast;
    try {
      if (!farmerFertilizer.fertilizedSprouts) throw new Error('No Fertilized Sprouts to Rinse.');
      if (!values.destination)          throw new Error('No destination set.');
      if (!account)            throw new Error('Connect a wallet first.');

      txToast = new TransactionToast({
        loading: `Rinsing ${displayFullBN(farmerFertilizer.fertilizedSprouts)} Fertilized Sprouts`,
        success: 'Rinse successfull.',
      });

      const txn = await beanstalk.claimFertilized(
        Object.keys(farmerFertilizer.fertilizer),
        values.destination
      );
      txToast.confirming(txn);

      const receipt = await txn.wait();
      await refetchFertilizer(account);
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
  ]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <RinseForm
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Rinse;
