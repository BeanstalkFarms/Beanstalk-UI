import React, { useCallback, useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useAccount, useProvider } from 'wagmi';
import { useSigner } from 'hooks/ledger/useSigner';
import { BEAN, FERTILIZED_SPROUTS } from 'constants/tokens';
import { ZERO_BN } from 'constants/index';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useFarmerBalances from 'hooks/useFarmerBalances';
import { useBeanstalkContract, useFertilizerContract } from 'hooks/useContract';
import { TokenAdornment, TokenInputField, TokenOutputField, TxnSeparator } from 'components/Common/Form';
import TxnPreview from 'components/Common/Form/TxnPreview';
import TxnAccordion from 'components/Common/TxnAccordion';
import { useFetchFarmerFertilizer } from 'state/farmer/fertilizer/updater';
import useChainId from 'hooks/useChain';
import { displayBN, displayFullBN, parseError } from 'util/index';
import { BeanstalkReplanted } from 'generated';
import Farm, { FarmToMode } from 'lib/Beanstalk/Farm';
import { LoadingButton } from '@mui/lab';
import DestinationField from 'components/Field/DestinationField';
import useFarmerFertilizer from 'hooks/redux/useFarmerFertilizer';
import TransactionToast from 'components/Common/TxnToast';
import toast from 'react-hot-toast';

// ---------------------------------------------------

type BuyFormValues = {
  destination: FarmToMode;
  amount: BigNumber;
};

// ---------------------------------------------------

const RinseForm : React.FC<
  FormikProps<BuyFormValues>
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
  const { data: account } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const chainId = useChainId();
  
  /// Farmer data
  const farmerFertilizer = useFarmerFertilizer();
  const farmerBalances   = useFarmerBalances();

  /// Data refreshing
  const [refetchFertilizer] = useFetchFarmerFertilizer();

  /// Contracts
  const fertContract = useFertilizerContract(signer);
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farm = useMemo(() => new Farm(provider),   [provider]);

  const initialValues : BuyFormValues = useMemo(() => ({
    destination: FarmToMode.INTERNAL,
    amount: farmerFertilizer.fertilized,
  }), [farmerFertilizer.fertilized]);

  const onSubmit = useCallback(async (values: BuyFormValues, formActions: FormikHelpers<BuyFormValues>) => {
    let txToast;
    try {
      if (!farmerFertilizer.fertilized) throw new Error('No Fertilized Sprouts to Rinse.');
      if (!values.destination)          throw new Error('No destination set.');
      if (!account?.address)            throw new Error('Connect a wallet first.');

      //
      // console.log(await beanstalk.balanceOfFertilizer(account?.address || '', '6000000'))
      // console.log(await beanstalk.balanceOfFertilized(account?.address || '', ['6000000']))
      txToast = new TransactionToast({
        loading: `Rinsing ${displayFullBN(farmerFertilizer.fertilized)} Fertilized Sprouts`,
        success: 'Rinse successfull.',
      });

      const txn = await beanstalk.claimFertilized(
        Object.keys(farmerFertilizer.tokens),
        values.destination
      );
      txToast.confirming(txn);

      const receipt = await txn.wait();
      await refetchFertilizer(account.address);
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
    account?.address,
    farmerFertilizer?.tokens,
    farmerFertilizer?.fertilized,
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
