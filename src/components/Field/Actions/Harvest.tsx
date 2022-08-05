import React, { useCallback, useMemo } from 'react';
import { Accordion, AccordionDetails, Box, Stack } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useAccount, useProvider } from 'wagmi';
import { useSigner } from '~/hooks/ledger/useSigner';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { useBeanstalkContract } from '~/hooks/useContract';
import { ActionType } from '~/util/Actions';
import {
  SmartSubmitButton, TokenInputField, TokenOutputField,
  TxnPreview,
  TxnSeparator
} from 'components/Common/Form';
import { BeanstalkReplanted } from 'generated/index';
import Farm, { FarmToMode } from '~/lib/Beanstalk/Farm';
import {
  displayFullBN,
  parseError,
  toStringBaseUnitBN
} from '~/util/index';
import toast from 'react-hot-toast';
import useFarmerField from '~/hooks/useFarmerField';
import { useFetchFarmerField } from '~/state/farmer/field/updater';
import { useFetchFarmerBalances } from '~/state/farmer/balances/updater';
import { BEAN, PODS } from '~/constants/tokens';
import copy from '~/constants/copy';
import DestinationField from '../../Common/Form/DestinationField';
import TransactionToast from '../../Common/TxnToast';
import { ZERO_BN } from '../../../constants';
import TokenAdornment from '../../Common/Form/TokenAdornment';

// -----------------------------------------------------------------------

type HarvestFormValues = {
  amount: BigNumber;
  destination: FarmToMode;
}

// -----------------------------------------------------------------------

const HarvestForm: React.FC<FormikProps<HarvestFormValues> & {
  harvestablePods: BigNumber;
  farm: Farm;
}> = ({
  // Custom
  harvestablePods,
  // Formik
  values,
  isSubmitting,
}) => {
  /// Derived
  const amount = harvestablePods;
  const isSubmittable = (
    amount
    && amount.gt(0)
    && values.destination !== undefined
  );

  return (
    <Form autoComplete="off" noValidate>
      <Stack gap={1}>
        {/* Claimable Token */}
        <TokenInputField
          name="amount"
          balance={amount}
          balanceLabel="Harvestable Balance"
          disabled
          InputProps={{
            endAdornment: (
              <TokenAdornment
                token={PODS}
              />
            )
          }}
        />
        {/* Transaction Details */}
        {values.amount?.gt(0) ? (
          <>
            {/* Setting: Destination */}
            <DestinationField
              name="destination"
            />
            <TxnSeparator mt={-1} />
            <TokenOutputField
              token={BEAN[1]}
              amount={values.amount || ZERO_BN}
            />
            {/* <Box>
              <Alert
                color="warning"
                icon={
                  <IconWrapper boxSize={IconSize.medium}><WarningAmberIcon
                    sx={{ fontSize: IconSize.small }} />
                  </IconWrapper>
                }
              >
                You can Harvest your Pods and Deposit Beans into the Silo in one transaction on the&nbsp;
                <Link href={`/#/silo/${bean.address}`}>Bean</Link> or <Link href={`/#/silo/${lp.address}`}>LP</Link> Deposit
                page.
              </Alert>
            </Box> */}
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.HARVEST,
                        amount: amount
                      },
                      {
                        type: ActionType.RECEIVE_BEANS,
                        amount: amount,
                        destination: values.destination,
                      },
                    ]}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
        ) : null}
        <SmartSubmitButton
          loading={isSubmitting}
          disabled={!isSubmittable || isSubmitting}
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          tokens={[]}
          mode="auto"
        >
          Harvest
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

// -----------------------------------------------------------------------

const Harvest: React.FC<{}> = () => {
  ///
  const { data: account } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farm = useMemo(() => new Farm(provider), [provider]);

  ///
  const [refetchFarmerField] = useFetchFarmerField();
  const [refetchFarmerBalances] = useFetchFarmerBalances();

  ///
  const farmerField = useFarmerField();

  /// Form
  const initialValues: HarvestFormValues = useMemo(() => ({
    amount: farmerField.harvestablePods || null,
    destination: FarmToMode.INTERNAL,
  }), [farmerField.harvestablePods]);

  const onSubmit = useCallback(
    async (
      values: HarvestFormValues,
      formActions: FormikHelpers<HarvestFormValues>
    ) => {
      let txToast;
      try {
        if (!farmerField.harvestablePods.gt(0)) throw new Error('No Harvestable Pods.');
        if (!farmerField.harvestablePlots) throw new Error('No Harvestable Plots.');
        if (!account?.address) throw new Error('Connect a wallet first.');

        txToast = new TransactionToast({
          loading: `Harvesting ${displayFullBN(farmerField.harvestablePods, PODS.displayDecimals)} Pods.`,
          success: `Harvest successful. Added ${displayFullBN(farmerField.harvestablePods, PODS.displayDecimals)} Beans to your ${copy.TO_MODE[values.destination]}.`,
        });

        const txn = await beanstalk.harvest(
          Object.keys(farmerField.harvestablePlots).map((harvestIndex) =>
            toStringBaseUnitBN(harvestIndex, 6)
          ),
          values.destination
        );
        txToast.confirming(txn);

        const receipt = await txn.wait();
        await Promise.all([
          refetchFarmerField(),
          refetchFarmerBalances()
        ]);
        txToast.success(receipt);
        formActions.resetForm();
      } catch (err) {
        txToast ? txToast.error(err) : toast.error(parseError(err));
        formActions.setSubmitting(false);
      }
    },
    [
      account?.address,
      beanstalk,
      farmerField.harvestablePlots,
      farmerField.harvestablePods,
      refetchFarmerBalances,
      refetchFarmerField,
    ]
  );

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <Stack spacing={1}>
          <HarvestForm
            harvestablePods={farmerField.harvestablePods}
            farm={farm}
            {...formikProps}
          />
        </Stack>
      )}
    </Formik>
  );
};

export default Harvest;
