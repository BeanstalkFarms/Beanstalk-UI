import React, { useCallback, useEffect, useMemo } from 'react';
import { Accordion, AccordionDetails, Box, Stack, Tooltip } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useProvider } from 'wagmi';
import { ethers } from 'ethers';
import { BEAN, BEAN_CRV3_LP, CRV3, DAI, ETH, SEEDS, STALK, UNRIPE_BEAN, UNRIPE_BEAN_CRV3, USDC, USDT, WETH } from 'constants/tokens';
import TokenOutputField from 'components/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { FormState, SettingInput, TxnSettings } from 'components/Common/Form';
import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import TxnPreview from 'components/Common/Form/TxnPreview';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import Beanstalk from 'lib/Beanstalk';
import { useBeanstalkContract } from 'hooks/useContract';
import { displayFullBN, MinBN, toStringBaseUnitBN } from 'util/Tokens';
import TransactionToast from 'components/Common/TxnToast';
import { BeanstalkReplanted } from 'generated/index';
import { QuoteHandler } from 'hooks/useQuote';
import { ZERO_BN } from 'constants/index';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import Pool from 'classes/Pool';
import Farm, { FarmFromMode, FarmToMode } from 'lib/Beanstalk/Farm';
import useGetChainToken from 'hooks/useGetChainToken';
import TxnSeparator from 'components/Common/Form/TxnSeparator';
import useToggle from 'hooks/display/useToggle';
import useTokenMap from 'hooks/useTokenMap';
import { useSigner } from 'hooks/ledger/useSigner';
import { useFetchFarmerSilo } from 'state/farmer/silo/updater';
import { parseError, tokenResult } from 'util/index';
import toast from 'react-hot-toast';
import { useFetchFarmerBalances } from 'state/farmer/balances/updater';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import useFarmerSiloBalances from 'hooks/useFarmerSiloBalances';
import { FarmerSilo } from 'state/farmer/silo';
import PillRow from 'components/Common/Form/PillRow';
import TokenSelectDialog, { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import { LoadingButton } from '@mui/lab';

// -----------------------------------------------------------------------

type ConvertFormValues = FormState & {
  settings: {
    slippage: number;
  };
  maxAmountIn: BigNumber | null;
  tokenOut: Token | null;
};

// -----------------------------------------------------------------------

const DepositForm : React.FC<
  FormikProps<ConvertFormValues> & {
    tokenList: (ERC20Token | NativeToken)[];
    whitelistedToken: ERC20Token | NativeToken;
    amountToBdv: (amount: BigNumber) => BigNumber;
    siloBalances: FarmerSilo['balances'];
    beanstalk: BeanstalkReplanted;
    handleQuote: QuoteHandler;
  }
> = ({
  // Custom
  tokenList,
  whitelistedToken,
  amountToBdv,
  siloBalances,
  beanstalk,
  handleQuote,
  // Formik
  values,
  isSubmitting,
  setFieldValue,
}) => {
  const chainId = useChainId();
  // TODO: constrain this when siloToken = Unripe
  const [isTokenSelectVisible, showTokenSelect, hideTokenSelect] = useToggle();

  //
  const { amount, bdv, stalk, seeds, actions } = Beanstalk.Silo.Deposit.deposit(
    whitelistedToken,
    values.tokens,
    amountToBdv,
  );
  const isMainnet = chainId === SupportedChainId.MAINNET;
  
  const handleSelectTokens = useCallback(async (_tokens: Set<Token>) => {
    const arr = Array.from(_tokens);
    if (arr.length !== 1) throw new Error();
    const tokenOut = arr[0];
    setFieldValue('tokenOut', tokenOut);
    setFieldValue('maxAmountIn', null);
  }, [setFieldValue]);

  const balance      = siloBalances[whitelistedToken.address]?.deposited?.amount || ZERO_BN;
  const canConvert   = values.maxAmountIn?.gt(0) || false;
  const isReady      = false;
  let isLoading      = false;
  let buttonContent;
  if (values.maxAmountIn === null) {
    if (values.tokenOut) {
      buttonContent = 'Refreshing convert data...';
      isLoading = false;
    } else {
      buttonContent = 'No output selected';
      isLoading = false;
    }
  } else if (!canConvert) {
    buttonContent = 'Pathway unavailable';
  }

  useEffect(() => {
    (async () => {
      if (values.tokenOut) {
        const _maxAmountIn = (
          await beanstalk.getMaxAmountIn(
            whitelistedToken.address,
            values.tokenOut.address,
          )
            .then(tokenResult(whitelistedToken))
            .catch(() => ZERO_BN) // if calculation fails, pathway is unavailable
        );
        setFieldValue('maxAmountIn', _maxAmountIn);
      }
    })();
  }, [beanstalk, setFieldValue, values.tokenOut, whitelistedToken]);

  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate autoComplete="off">
        <TokenSelectDialog
          open={isTokenSelectVisible}
          handleClose={hideTokenSelect}
          handleSubmit={handleSelectTokens}
          selected={values.tokens}
          balances={{}}
          tokenList={[]}
          mode={TokenSelectMode.SINGLE}
        />
        <Stack gap={1}>
          {/* Input token */}
          <TokenQuoteProvider
            name="tokens.0"
            tokenOut={whitelistedToken}
            max={MinBN(values.maxAmountIn || ZERO_BN, balance)}
            balance={balance}
            state={values.tokens[0]}
            handleQuote={handleQuote}
            tokenSelectLabel={`Deposited ${whitelistedToken.symbol}`}
            disabled={!values.maxAmountIn || values.maxAmountIn.eq(0)}
            quote={values.maxAmountIn ? <>To peg: {displayFullBN(values.maxAmountIn, whitelistedToken.decimals)}</> : undefined}
          />
          {/* Output token */}
          <PillRow
            isOpen={isTokenSelectVisible}
            label="Convert to"
            onClick={showTokenSelect}
          >
            {values.tokenOut?.name || 'Select token'}
          </PillRow>
          {isReady ? (
            <>
              <TxnSeparator mt={-1} />
              <TokenOutputField
                token={whitelistedToken}
                amount={amount}
              />
              <Stack direction="row" gap={1} justifyContent="center">
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={STALK}
                    amount={stalk}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={SEEDS}
                    amount={seeds}
                  />
                </Box>
              </Stack>
              <Box>
                <Accordion variant="outlined">
                  <StyledAccordionSummary title="Transaction Details" />
                  <AccordionDetails>
                    <TxnPreview
                      actions={actions}
                    />
                  </AccordionDetails>
                </Accordion>
              </Box>
            </>
          ) : null}
          <LoadingButton
            loading={isLoading}
            loadingPosition="start"
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={!isReady}
          >
            {buttonContent}
          </LoadingButton>
        </Stack>
      </Form>
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

const Convert : React.FC<{
  pool: Pool;
  fromToken: ERC20Token | NativeToken;
}> = ({
  pool,
  fromToken
}) => {
  /// Chain Constants
  const getChainToken = useGetChainToken();
  const Eth  = getChainToken(ETH);
  const Weth = getChainToken(WETH);
  const Bean = getChainToken(BEAN);
  const BeanCrv3 = getChainToken(BEAN_CRV3_LP);
  const urBean = getChainToken(UNRIPE_BEAN);
  const urBeanCrv3 = getChainToken(UNRIPE_BEAN_CRV3);
  const allAvailableTokens = useTokenMap([
    BEAN,
    ETH,
    WETH,
    fromToken,
    CRV3,
    DAI,
    USDC,
    USDT
  ]);

  /// Derived
  const isUnripe = (
    fromToken === urBean || 
    fromToken === urBeanCrv3
  );

  /// Token List
  const [tokenList, initialTokenOut] = useMemo(() => {
    const allTokens = isUnripe
      ? [
        getChainToken(UNRIPE_BEAN),
        getChainToken(UNRIPE_BEAN_CRV3),
      ]
      : [
        getChainToken(BEAN),
        getChainToken(BEAN_CRV3_LP),
      ];
    const _tokenList = allTokens.filter((_token) => _token !== fromToken);
    return [
      _tokenList,     // all available tokens to convert to
      _tokenList[0],  // tokenOut is the first available token that isn't the fromToken
    ];
  }, [isUnripe, getChainToken, fromToken]);

  /// Beanstalk
  const bdvPerToken = useSelector<AppState, AppState['_beanstalk']['silo']['balances'][string]['bdvPerToken'] | BigNumber>(
    (state) => state._beanstalk.silo.balances[fromToken.address]?.bdvPerToken || ZERO_BN
  );
  const amountToBdv = useCallback((amount: BigNumber) => bdvPerToken.times(amount), [bdvPerToken]);

  /// Farmer
  const siloBalances            = useFarmerSiloBalances();
  const [refetchFarmerSilo]     = useFetchFarmerSilo();
  const [refetchFarmerBalances] = useFetchFarmerBalances();

  /// Network
  const provider = useProvider();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;

  /// Farm
  const farm = useMemo(() => new Farm(provider), [provider]);

  /// Form setup
  const initialValues : ConvertFormValues = useMemo(() => ({
    // Settings
    settings: {
      slippage: 0.1,
    },
    // Token Inputs
    tokens: [
      {
        token:      fromToken,
        amount:     null,
        quoting:    false,
        amountOut:  undefined,
      },
    ],
    // Convert data
    maxAmountIn:    null,
    // Token Outputs
    tokenOut:       initialTokenOut,
  }), [fromToken, initialTokenOut]);

  /// Handlers
  // This handler does not run when _tokenIn = _tokenOut (direct deposit)
  const handleQuote = useCallback<QuoteHandler>(
    async (_tokenIn, _amountIn, _tokenOut) => {
      const tokenIn  : ERC20Token = _tokenIn  instanceof NativeToken ? Weth : _tokenIn;
      const tokenOut : ERC20Token = _tokenOut instanceof NativeToken ? Weth : _tokenOut;
      const amountIn = ethers.BigNumber.from(toStringBaseUnitBN(_amountIn, tokenIn.decimals));
      return _amountIn;
    },
    [Weth]
  );

  const onSubmit = useCallback(async (values: ConvertFormValues, formActions: FormikHelpers<ConvertFormValues>) => {
    let txToast;
    try {
      if (!values.settings.slippage) throw new Error('No slippage value set.');

      // FIXME: getting BDV per amount here
      const { amount } = Beanstalk.Silo.Deposit.deposit(
        fromToken,
        values.tokens,
        amountToBdv,
      );

      txToast = new TransactionToast({
        loading: `Depositing ${displayFullBN(amount.abs(), fromToken.displayDecimals, fromToken.displayDecimals)} ${fromToken.name} to the Silo`,
        success: 'Deposit successful.',
      });
      
      const formData = values.tokens[0];
      if (values.tokens.length > 1) throw new Error('Only one token supported at this time');
      if (!formData?.amount || formData.amount.eq(0)) throw new Error('No amount set');

      // TEMP: recast as BeanstalkReplanted 
      const b = ((beanstalk as unknown) as BeanstalkReplanted);
      const data : string[] = [];
      
      //
      const inputToken = formData.token;
      let value = ZERO_BN;
      let depositAmount;
      let depositFrom;

      // Direct Deposit
      if (inputToken === fromToken) {
        // TODO: verify we have approval for `inputToken`
        depositAmount = formData.amount; // implicit: amount = amountOut since the tokens are the same
        depositFrom   = FarmFromMode.INTERNAL_EXTERNAL;
      }
      
      // Swap and Deposit
      else {
        // Require a quote
        if (!formData.steps || !formData.amountOut) throw new Error(`No quote available for ${formData.token.symbol}`);

        // Wrap ETH to WETH
        if (inputToken === Eth) {
          value = value.plus(formData.amount); 
          data.push(b.interface.encodeFunctionData('wrapEth', [
            toStringBaseUnitBN(value, Eth.decimals),
            FarmToMode.INTERNAL, // to
          ]));
        }
        
        // `amountOut` of `siloToken` is received when swapping for 
        // `amount` of `inputToken`. this may include multiple swaps.
        // using "tolerant" mode allows for slippage during swaps.
        depositAmount = formData.amountOut;
        depositFrom   = FarmFromMode.INTERNAL_TOLERANT;

        // Encode steps to get from token i to siloToken
        const encoded = Farm.encodeStepsWithSlippage(
          formData.steps,
          0.1 / 100,
          // ethers.BigNumber.from(
          //   toStringBaseUnitBN(
          //     values.settings.slippage / 100,
          //     Farm.SLIPPAGE_PRECISION.toNumber()
          //   )
          // ), // slippage
        );
        data.push(...encoded);
        encoded.forEach((_data, index) => 
          console.debug(`[Deposit] step ${index}:`, formData.steps?.[index]?.decode(_data).map((elem) => (elem instanceof ethers.BigNumber ? elem.toString() : elem)))
        );
      } 

      // Deposit step
      data.push(
        b.interface.encodeFunctionData('deposit', [
          fromToken.address,
          toStringBaseUnitBN(depositAmount, fromToken.decimals),  // expected amountOut from all steps
          depositFrom,
        ])
      );
    
      const txn = await b.farm(data, { value: toStringBaseUnitBN(value, Eth.decimals) });
      txToast.confirming(txn);

      const receipt = await txn.wait();
      await Promise.all([
        refetchFarmerSilo(),
        refetchFarmerBalances(),
      ]);
      txToast.success(receipt);
      formActions.resetForm();
    } catch (err) {
      txToast ? txToast.error(err) : toast.error(parseError(err));
      formActions.setSubmitting(false);
    }
  }, [
    Eth,
    beanstalk,
    fromToken,
    amountToBdv,
    refetchFarmerSilo,
    refetchFarmerBalances,
  ]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <DepositForm
            handleQuote={handleQuote}
            amountToBdv={amountToBdv}
            tokenList={tokenList as (ERC20Token | NativeToken)[]}
            whitelistedToken={fromToken}
            siloBalances={siloBalances}
            beanstalk={beanstalk}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Convert;
