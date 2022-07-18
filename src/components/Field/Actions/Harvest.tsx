import React, { useCallback, useMemo } from 'react';
import { Accordion, AccordionDetails, Box, Button, Link, Stack, Tooltip, Typography } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useAccount, useProvider } from 'wagmi';
import { useSigner } from 'hooks/ledger/useSigner';
import { BEAN, BEAN_CRV3_LP, PODS } from 'constants/tokens';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import { useBeanstalkContract } from 'hooks/useContract';
import { ActionType } from 'util/Actions';
import {
  FormTokenState, TokenOutputField,
  TokenQuoteProvider,
  TxnPreview,
  TxnSeparator
} from 'components/Common/Form';
import { BeanstalkReplanted } from 'generated/index';
import Farm, { FarmToMode } from 'lib/Beanstalk/Farm';
import {
  displayBN,
  displayTokenAmount,
  getChainConstant,
  parseError,
  toStringBaseUnitBN,
  toTokenUnitsBN
} from 'util/index';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { AppState } from '../../../state';
import { QuoteHandler } from '../../../hooks/useQuote';
import DestinationField from '../DestinationField';
import TransactionToast from '../../Common/TxnToast';
import { ZERO_BN } from '../../../constants';
import Warning from '../../Common/Form/Warning';
import TokenAdornment from '../../Common/Form/TokenAdornment';

// -----------------------------------------------------------------------

type HarvestFormValues = {
  token: FormTokenState;
  destination: FarmToMode;
}

// -----------------------------------------------------------------------

const HarvestForm: React.FC<FormikProps<HarvestFormValues> & {
  harvestablePods: BigNumber;
  farm: Farm;
}> = ({
  // Custom
  harvestablePods,
  // eslint-disable-next-line
  farm,
  // Formik
  values,
  isSubmitting,
  setFieldValue,
}) => {
  const chainId = useChainId();
  const isMainnet = chainId === SupportedChainId.MAINNET;
  const bean = getChainConstant(BEAN, chainId);
  const lp = getChainConstant(BEAN_CRV3_LP, chainId);

  //
  const amount = harvestablePods;
  const isSubmittable = (
    amount
    && amount.gt(0)
    && values.destination !== undefined
  );

  const handleQuote = useCallback<QuoteHandler>(
    async (_tokenIn, _amountIn, _tokenOut) => {
      if (_tokenIn === _tokenOut) return { amountOut: _amountIn };
      return {
        amountOut: toTokenUnitsBN('1000000000', _tokenOut.decimals),
      };
    },
    []
  );

  // This should be memoized to prevent an infinite reset loop
  const quoteSettings = useMemo(() => ({
    ignoreSameToken: false,
    onReset: () => ({ amountOut: harvestablePods }),
  }), [harvestablePods]);

  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate>
        <Stack gap={1}>
          {/* Form Content */}
          <Stack gap={1}>
            {/* Claimable Token */}
            <TokenQuoteProvider
              name="token"
              tokenOut={BEAN[1]}
              balance={amount}
              balanceLabel="Harvestable Pod Balance"
              state={values.token}
              disabled
              quoteSettings={quoteSettings}
              handleQuote={handleQuote}
              hideQuote
              InputProps={{
                endAdornment: (
                  <TokenAdornment
                    token={PODS}
                  />
                )
              }}
            />
            {/* Setting: Destination */}
            <DestinationField
              name="destination"
            />
          </Stack>
          {/* Transaction Details */}
          <>
            <TxnSeparator mt={-1} />
            <TokenOutputField
              token={BEAN[1]}
              amount={values.token.amountOut || ZERO_BN}
              isLoading={values.token.quoting}
            />
            <Warning
              message={(
                <Typography variant="body1">You can Harvest your Pods and Deposit Beans into the Silo in one transaction on the <Link href={`/#/silo/${bean.address}`}>Bean</Link> or <Link href={`/#/silo/${lp.address}`}>LP</Link> Deposit page.</Typography>
              )}
            />
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BASE,
                        message: `Harvest ${displayTokenAmount(amount, PODS)}.`
                      },
                      {
                        type: ActionType.BASE,
                        message: `Receive ${displayTokenAmount(amount, BEAN[1])}.`
                      },
                    ]}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
          <Button disabled={!isSubmittable || isSubmitting || isMainnet} type="submit" size="large" fullWidth>
            Harvest
          </Button>
        </Stack>
      </Form>
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

const Harvest: React.FC<{}> = () => {
  const { data: account } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farm = useMemo(() => new Farm(provider), [provider]);

  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field);

  // Form
  const initialValues: HarvestFormValues = useMemo(() => ({
    destination: FarmToMode.INTERNAL,
    token: {
      token: BEAN[1],
      amount: farmerField.harvestablePods,
      amountOut: farmerField.harvestablePods
    }
  }), [farmerField.harvestablePods]);

  const onSubmit = useCallback(async (values: HarvestFormValues, formActions: FormikHelpers<HarvestFormValues>) => {
    let txToast;
    try {
      if (!farmerField.harvestablePods.gt(0)) throw new Error('No Harvestable Pods.');
      if (!farmerField.harvestablePlots) throw new Error('No Harvestable Plots.');
      if (!account?.address) throw new Error('Connect a wallet first.');

      txToast = new TransactionToast({
        loading: `Harvesting ${displayBN(farmerField.harvestablePods)} pods.`,
        success: 'Harvest successful.',
      });

      const txn = await beanstalk.harvest(
        Object.keys(farmerField.harvestablePlots).map((harvestIndex) => toStringBaseUnitBN(harvestIndex, 6)),
        values.destination
      );

      txToast.confirming(txn);

      const receipt = await txn.wait();
      txToast.success(receipt);
    } catch (err) {
      txToast ? txToast.error(err) : toast.error(parseError(err));
      formActions.setSubmitting(false);
    }
  }, [account?.address, beanstalk, farmerField.harvestablePlots, farmerField.harvestablePods]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <Stack spacing={1}>
          {/* <pre>{JSON.stringify(formikProps.values, null, 2)}</pre> */}
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
