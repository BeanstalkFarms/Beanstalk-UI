import React, { useCallback, useMemo } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useAccount, useProvider } from 'wagmi';
import { useSigner } from 'hooks/ledger/useSigner';
import { Token } from 'classes';
import { BEAN, BEAN_CRV3_LP } from 'constants/tokens';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import { useBeanstalkContract } from 'hooks/useContract';
import { ActionType } from 'util/Actions';
import usePools from 'hooks/usePools';
import { ERC20Token } from 'classes/Token';
import {
  FormTokenState,
  TokenOutputField,
  TokenQuoteProvider,
  TokenSelectDialog,
  TxnPreview,
  TxnSeparator
} from 'components/Common/Form';
import { BeanstalkReplanted } from 'generated/index';
import Farm, { FarmToMode } from 'lib/Beanstalk/Farm';
import useGetChainToken from 'hooks/useGetChainToken';
import { ZERO_BN } from 'constants/index';
import { displayBN, displayTokenAmount, parseError, toTokenUnitsBN } from 'util/index';
import TokenIcon from 'components/Common/TokenIcon';
import useToggle from 'hooks/display/useToggle';
import { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import PillRow from 'components/Common/Form/PillRow';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { AppState } from '../../../state';
import { QuoteHandler } from '../../../hooks/useQuote';
import DestinationField from '../DestinationField';
import TransactionToast from '../../Common/TxnToast';

// -----------------------------------------------------------------------

type HarvestFormValues = {
  token: FormTokenState;
  destination: FarmToMode;
  tokenOut: ERC20Token;
}

// -----------------------------------------------------------------------

const HarvestForm : React.FC<
  FormikProps<HarvestFormValues> & {
    token: Token;
    harvestablePods: BigNumber;
    farm: Farm;
  }
> = ({
  // Custom
  token,
  harvestablePods,
  farm,
  // Formik
  values,
  isSubmitting,
  setFieldValue,
}) => {
  const chainId = useChainId();
  const pools = usePools();
  const isMainnet = chainId === SupportedChainId.MAINNET;
  const getChainToken = useGetChainToken();

  // ASSUMPTION: Pool address === LP Token address
  // Lazy way to do this. Should key pools by lpToken.address.
  const pool = pools[token.address];
  const claimableTokens = useMemo(() => ([
    token,
    ...(token.isLP && pool?.tokens || []),
  ]), [pool, token]);

  //
  const amount = harvestablePods;
  const isSubmittable = (
    amount
    && amount.gt(0)
    && values.destination !== undefined
  );
  const destination = (
    values.destination === FarmToMode.EXTERNAL
      ? 'to your wallet'
      : 'to your internal balance'
  );

  // const handleQuote = () => {
  //
  // };
  
  const handleQuote = useCallback<QuoteHandler>(
    async (_tokenIn, _amountIn, _tokenOut) => {
      if (_tokenIn === _tokenOut) return { amountOut: _amountIn };
      return {
        amountOut: toTokenUnitsBN('1000000000', _tokenOut.decimals),
      };
    },
    []
  );

  // const [result, quoting, refreshQuote] = useQuote(values.tokenOut, handleQuote, { ignoreSameToken: false })
  const [isTokenSelectVisible, showTokenSelect, hideTokenSelect] = useToggle();

  //
  const handleSelectTokens = useCallback((_tokens: Set<Token>) => {
    const _token = Array.from(_tokens)[0];
    setFieldValue('tokenOut', _token);
  }, [setFieldValue]);

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
              tokenOut={values.tokenOut}
              // balance={amount}
              balance={undefined}
              state={values.token}
              disabled
              // FIXME:
              // "disableTokenSelect" applies the disabled prop to
              // the TokenSelect button. However if we don't pass
              // a handler to the button then it's effectively disabled
              // but shows with stronger-colored text. param names are
              // a bit confusing.
              // disableTokenSelect={true}
              quoteSettings={quoteSettings}
              handleQuote={handleQuote}
              hideQuote
            />
            {/* Setting: Destination */}
            <DestinationField
              name="destination"
            />
            {/* Setting: Claim LP */}
            <PillRow
              isOpen={isTokenSelectVisible}
              label="Deposit as"
              onClick={showTokenSelect}>
              <TokenIcon token={values.tokenOut} />
              <Typography variant="body1">{values.tokenOut.name}</Typography>
            </PillRow>
            <TokenSelectDialog
              open={isTokenSelectVisible}
              handleClose={hideTokenSelect}
              handleSubmit={handleSelectTokens}
              selected={[values.tokenOut]}
              balances={undefined} // hide balances from right side of selector
              tokenList={claimableTokens}
              mode={TokenSelectMode.SINGLE}
            />
          </Stack>
          {/* Transaction Details */}

          <>
            <TxnSeparator mt={-1} />
            <TokenOutputField
              token={values.tokenOut}
              amount={values.token.amountOut || ZERO_BN}
              isLoading={values.token.quoting}
            />
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BASE,
                        message: `Claim ${displayTokenAmount(amount, token)}.`
                      },
                      {
                        type: ActionType.BASE,
                        message: values.tokenOut === token ? (
                          `Unpack ${displayTokenAmount(amount, token)} into 3CRV and send ${destination}.`
                        ) : (
                          `Send ${displayTokenAmount(amount, token)} and send ${destination}.`
                        )
                      }
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

const Harvest : React.FC<{}> = () => {
  const { data: account } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farm = useMemo(() => new Farm(provider), [provider]);
  
  const farmerField  = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field);

  // Form
  const initialValues : HarvestFormValues = useMemo(() => ({
    destination: FarmToMode.INTERNAL,
    tokenOut: BEAN_CRV3_LP[1],
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
        Object.keys(farmerField.harvestablePlots),
        values.destination
      );

      txToast.confirming(txn);

      const receipt = await txn.wait();
      txToast.success(receipt);
    } catch (err) {
      txToast ? txToast.error(err) : toast.error(parseError(err));
    }
  }, [account?.address, beanstalk, farmerField.harvestablePlots, farmerField.harvestablePods]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <Stack spacing={1}>
          {/* <pre>{JSON.stringify(formikProps.values, null, 2)}</pre> */}
          <HarvestForm
            token={BEAN[1]}
            harvestablePods={farmerField.harvestablePods}
            // harvestablePods={new BigNumber(100)}
            farm={farm}
            {...formikProps}
          />
        </Stack>
      )}
    </Formik>
  );
};

export default Harvest;
