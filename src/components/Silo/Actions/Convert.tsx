import React, { useCallback, useEffect, useMemo } from 'react';
import { Accordion, AccordionDetails, Box, Stack } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useProvider } from 'wagmi';
import { BEAN, BEAN_CRV3_LP, SEEDS, STALK, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from 'constants/tokens';
import TokenOutputField from 'components/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { FormState, SettingInput, TxnSettings } from 'components/Common/Form';
import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import TxnPreview from 'components/Common/Form/TxnPreview';
import Beanstalk from 'lib/Beanstalk';
import { useBeanstalkContract } from 'hooks/useContract';
import { displayFullBN, MinBN, toStringBaseUnitBN } from 'util/Tokens';
import { BeanstalkReplanted } from 'generated/index';
import { QuoteHandler } from 'hooks/useQuote';
import { ZERO_BN } from 'constants/index';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import Pool from 'classes/Pool';
import Farm from 'lib/Beanstalk/Farm';
import useGetChainToken from 'hooks/useGetChainToken';
import TxnSeparator from 'components/Common/Form/TxnSeparator';
import useToggle from 'hooks/display/useToggle';
import { useSigner } from 'hooks/ledger/useSigner';
import { useFetchFarmerSilo } from 'state/farmer/silo/updater';
import { tokenResult, parseError } from 'util/index';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import useFarmerSiloBalances from 'hooks/useFarmerSiloBalances';
import { FarmerSilo } from 'state/farmer/silo';
import PillRow from 'components/Common/Form/PillRow';
import TokenSelectDialog, { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import { LoadingButton } from '@mui/lab';
import useSeason from 'hooks/useSeason';
import { Encoder as ConvertEncoder } from 'lib/Beanstalk/Silo/Convert';
import { ethers } from 'ethers';
import TransactionToast from 'components/Common/TxnToast';
import toast from 'react-hot-toast';

// -----------------------------------------------------------------------

type ConvertFormValues = FormState & {
  settings: {
    slippage: number;
  };
  maxAmountIn: BigNumber | null;
  tokenOut: Token | null;
};

// -----------------------------------------------------------------------

const ConvertForm : React.FC<
  FormikProps<ConvertFormValues> & {
    tokenList: (ERC20Token | NativeToken)[];
    whitelistedToken: ERC20Token | NativeToken;
    siloBalances: FarmerSilo['balances'];
    beanstalk: BeanstalkReplanted;
    handleQuote: QuoteHandler;
    currentSeason: BigNumber;
  }
> = ({
  // Custom
  tokenList,
  whitelistedToken,
  siloBalances,
  beanstalk,
  handleQuote,
  currentSeason,
  // Formik
  values,
  isSubmitting,
  setFieldValue,
}) => {
  /// Local state
  const [isTokenSelectVisible, showTokenSelect, hideTokenSelect] = useToggle();

  ///
  const bdvPerAmountOut = useSelector<AppState, AppState['_beanstalk']['silo']['balances'][string]['bdvPerToken'] | BigNumber>(
    (state) => (
      values.tokenOut && state._beanstalk.silo.balances[values.tokenOut.address]?.bdvPerToken || ZERO_BN
    )
  );
  const amountOutToBDV = useCallback((amount: BigNumber) => bdvPerAmountOut.times(amount), [bdvPerAmountOut]);

  ///
  const converted = useMemo(() => (
    values.tokenOut ? Beanstalk.Silo.Convert.convert(
      whitelistedToken, // from
      values.tokenOut,  // to
      values.tokens[0].amount || ZERO_BN, // amount
      siloBalances[whitelistedToken.address]?.deposited?.crates, // depositedCrates
      currentSeason,
    ) : {
      amount: ZERO_BN,
      bdv:    ZERO_BN,
      stalk:  ZERO_BN,
      seeds:  ZERO_BN,
      actions: []
    }
  ), [currentSeason, siloBalances, values.tokenOut, values.tokens, whitelistedToken]);
  
  ///
  const handleSelectTokens = useCallback(async (_tokens: Set<Token>) => {
    const arr = Array.from(_tokens);
    if (arr.length !== 1) throw new Error();
    const tokenOut = arr[0];
    setFieldValue('tokenOut', tokenOut);
    setFieldValue('maxAmountIn', null);
  }, [setFieldValue]);

  const balance      = siloBalances[whitelistedToken.address]?.deposited?.amount || ZERO_BN;
  const canConvert   = values.maxAmountIn?.gt(0) || false;
  let isReady        = false;
  let buttonLoading  = false;
  let buttonContent;
  let bdvOut;
  let deltaBDV;
  let deltaStalk;
  let deltaSeedsPerBDV = ZERO_BN;
  let deltaSeeds;
  if (values.maxAmountIn === null) {
    if (values.tokenOut) {
      buttonContent = 'Refreshing convert data...';
      buttonLoading = false;
    } else {
      buttonContent = 'No output selected';
      buttonLoading = false;
    }
  } else if (!canConvert) {
    buttonContent = 'Pathway unavailable';
  } else {
    buttonContent = 'Convert';
    if (values.tokens[0].amountOut?.gt(0) && values.tokenOut) {
      isReady    = true;
      bdvOut     = amountOutToBDV(values.tokens[0].amountOut);
      deltaBDV   = (
        bdvOut
          .minus(converted.bdv.abs())
      );
      deltaStalk = (
        values.tokenOut.getStalk(deltaBDV)
      );
      deltaSeedsPerBDV = (
        values.tokenOut.getSeeds()
          .minus(values.tokens[0].token.getSeeds())
      );
      deltaSeeds = (
        values.tokenOut.getSeeds(bdvOut)  // seeds for depositing this token with new BDV
          .minus(converted.seeds.abs())   // seeds lost when converting
      );
    }
  }

  ///
  useEffect(() => {
    (async () => {
      if (values.tokenOut) {
        const _maxAmountIn = (
          await beanstalk.getMaxAmountIn(
            whitelistedToken.address,
            values.tokenOut.address,
          )
          .then(tokenResult(whitelistedToken))
          .catch(() => ZERO_BN) // if calculation fails, consider this pathway unavailable
        );
        setFieldValue('maxAmountIn', _maxAmountIn);
      }
    })();
  }, [beanstalk, setFieldValue, values.tokenOut, whitelistedToken]);

  return (
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
          tokenOut={(values.tokenOut || whitelistedToken) as ERC20Token}
          max={MinBN(values.maxAmountIn || ZERO_BN, balance)}
          balance={balance}
          state={values.tokens[0]}
          handleQuote={handleQuote}
          tokenSelectLabel={`Deposited ${whitelistedToken.symbol}`}
          disabled={!values.maxAmountIn || values.maxAmountIn.eq(0)}
          // quote={values.maxAmountIn ? <>To peg: {displayFullBN(values.maxAmountIn, whitelistedToken.decimals)}</> : undefined}
        />
        {/* Output token */}
        <PillRow
          isOpen={isTokenSelectVisible}
          label="Convert to"
          onClick={showTokenSelect}
        >
          {values.tokenOut?.name || 'Select token'}
        </PillRow>
        {(values.tokenOut && values.tokens[0].amountOut?.gt(0)) ? (
          <>
            <TxnSeparator mt={-1} />
            <TokenOutputField
              token={values.tokenOut!}
              amount={values.tokens[0].amountOut || ZERO_BN}
            />
            <Stack direction="row" gap={1} justifyContent="center">
              <Box sx={{ flex: 1 }}>
                <TokenOutputField
                  token={STALK}
                  amount={deltaStalk || ZERO_BN}
                  valueTooltip={( 
                    <>
                      This conversion will increase the BDV of your deposit by {displayFullBN(deltaBDV || ZERO_BN, 6)}{deltaBDV?.gt(0) ? ', resulting in a gain of Stalk' : ''}.
                      {/* BDV Removed: {displayFullBN(converted.bdv)}<br />
                      BDV Added: {displayFullBN(bdvOut || ZERO_BN)} */}
                    </>
                  )}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TokenOutputField
                  token={SEEDS}
                  amount={deltaSeeds || ZERO_BN}
                  valueTooltip={(
                    <>
                      Converting from {values.tokens[0].token.symbol} to {values.tokenOut.symbol} results in a {deltaSeedsPerBDV.gt(0) ? 'gain' : 'loss'} of {deltaSeedsPerBDV.abs().toString()} SEEDS per BDV.
                    </>
                  )}
                />
              </Box>
            </Stack>
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={converted.actions}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
        ) : null}
        <LoadingButton
          loading={buttonLoading}
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
  const Bean          = getChainToken(BEAN);
  const BeanCrv3      = getChainToken(BEAN_CRV3_LP);
  const urBean        = getChainToken(UNRIPE_BEAN);
  const urBeanCrv3    = getChainToken(UNRIPE_BEAN_CRV3);

  /// Derived
  const isUnripe = (
    fromToken === urBean || 
    fromToken === urBeanCrv3
  );

  /// Token List
  const [tokenList, initialTokenOut] = useMemo(() => {
    const allTokens = isUnripe
      ? [
        urBean,
        urBeanCrv3,
      ]
      : [
        Bean,
        BeanCrv3,
      ];
    const _tokenList = allTokens.filter((_token) => _token !== fromToken);
    return [
      _tokenList,     // all available tokens to convert to
      _tokenList[0],  // tokenOut is the first available token that isn't the fromToken
    ];
  }, [isUnripe, urBean, urBeanCrv3, Bean, BeanCrv3, fromToken]);

  /// Beanstalk
  const season = useSeason();

  /// Farmer
  const siloBalances            = useFarmerSiloBalances();
  const [refetchFarmerSilo]     = useFetchFarmerSilo();

  /// Network
  const provider          = useProvider();
  const { data: signer }  = useSigner();
  const beanstalk         = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farm              = useMemo(() => new Farm(provider), [provider]);

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
    async (_tokenIn, _amountIn, _tokenOut) => beanstalk.getAmountOut(
      _tokenIn.address,
      _tokenOut.address,
      toStringBaseUnitBN(_amountIn, _tokenIn.decimals),
    ).then(tokenResult(_tokenOut)),
    [beanstalk]
  );

  const onSubmit = useCallback(async (values: ConvertFormValues, formActions: FormikHelpers<ConvertFormValues>) => {
    let txToast;
    try {
      if (!values.settings.slippage) throw new Error('No slippage value set.');
      if (!values.tokenOut) throw new Error('No output token selected');
      if (!values.tokens[0].amount?.gt(0)) throw new Error('No amount input');
      if (!values.tokens[0].amountOut) throw new Error('No quote available.');
      
      const tokenIn   = values.tokens[0].token;     // converting from token
      const amountIn  = values.tokens[0].amount;    // amount of from token
      const tokenOut  = values.tokenOut;            // converting to token
      const amountOut = values.tokens[0].amountOut; // amount of to token
      const amountInStr  = tokenIn.stringify(amountIn);
      const amountOutStr = Farm.slip(
        ethers.BigNumber.from(tokenOut.stringify(amountOut)),
        values.settings.slippage / 100
      ).toString();
      
      const depositedCrates = siloBalances[tokenIn.address]?.deposited?.crates;
      if (!depositedCrates) throw new Error('No deposited crates available.');

      const conversion = Beanstalk.Silo.Convert.convert(
        tokenIn,  // from
        tokenOut, // to
        amountIn,
        depositedCrates,
        season,
      );

      txToast = new TransactionToast({
        loading: 'Converting',
        success: 'Convert successful.',
      });

      /// FIXME:
      /// Once the number of pathways increases, use a matrix
      /// to calculate available conversions and the respective
      /// encoding strategy. Just gotta get to Replant...
      let convertData;
      if (tokenIn === urBean && tokenOut === urBeanCrv3) {
        convertData = ConvertEncoder.unripeBeansToLP(
          amountInStr,      // amountBeans
          amountOutStr,     // minLP
        );
      } else if (tokenIn === urBeanCrv3 && tokenOut === urBean) {
        convertData = ConvertEncoder.unripeLPToBeans(
          amountInStr,      // amountLP
          amountOutStr,     // minBeans
        );
      } else if (tokenIn === Bean && tokenOut === BeanCrv3) {
        convertData = ConvertEncoder.beansToCurveLP(
          amountInStr,      // amountBeans
          amountOutStr,     // minLP
          tokenOut.address, // output token address = pool address
        );
      } else if (tokenIn === BeanCrv3 && tokenOut === Bean) {
        convertData = ConvertEncoder.curveLPToBeans(
          amountInStr,      // amountLP
          amountOutStr,     // minBeans
          tokenIn.address,  // output token address = pool address
        );
      } else {
        throw new Error('Unknown conversion pathway');
      }

      const crates  = conversion.deltaCrates.map((crate) => crate.season.toString());
      const amounts = conversion.deltaCrates.map((crate) => tokenIn.stringify(crate.amount.abs()));

      console.debug('[Convert] executing', {
        tokenIn,
        amountIn,
        tokenOut,
        amountOut,
        amountInStr,
        amountOutStr,
        depositedCrates,
        conversion,
        convertData,
        crates,
        amounts
      });

      // const txn = await beanstalk.convert(
      //   ConvertEncoder.beansToCurveLP(
      //     toStringBaseUnitBN(new BigNumber(1000), 6),   // bean
      //     toStringBaseUnitBN(new BigNumber(1000), 18),  // bean:3crv
      //     '0xc9C32cd16Bf7eFB85Ff14e0c8603cc90F6F2eE49', // bean:3crv
      //   ),
      //   ['6074'],
      //   [toStringBaseUnitBN(new BigNumber(1000), 6)]
      // );

      ///
      const txn = await beanstalk.convert(
        convertData,
        crates,
        amounts,
      );
      txToast.confirming(txn);

      const receipt = await txn.wait();
      await Promise.all([refetchFarmerSilo()]);
      txToast.success(receipt);
      formActions.resetForm();
    } catch (err) {
      console.error(err);
      txToast ? txToast.error(err) : toast.error(parseError(err));
      formActions.setSubmitting(false);
    }
  }, [Bean, BeanCrv3, beanstalk, refetchFarmerSilo, season, siloBalances, urBean, urBeanCrv3]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <ConvertForm
            handleQuote={handleQuote}
            tokenList={tokenList as (ERC20Token | NativeToken)[]}
            whitelistedToken={fromToken}
            siloBalances={siloBalances}
            beanstalk={beanstalk}
            currentSeason={season}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Convert;
