import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Alert, Box, Stack, Typography } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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
import useBDV from 'hooks/useBDV';
import TokenIcon from 'components/Common/TokenIcon';

// -----------------------------------------------------------------------

type ConvertFormValues = FormState & {
  settings: {
    slippage: number;
  };
  maxAmountIn: BigNumber | undefined;
  tokenOut: Token | undefined;
};

// -----------------------------------------------------------------------

const INIT_CONVERSION = {
  amount: ZERO_BN,
  bdv:    ZERO_BN,
  stalk:  ZERO_BN,
  seeds:  ZERO_BN,
  actions: []
};

const ConvertForm : React.FC<
  FormikProps<ConvertFormValues> & {
    /** List of tokens that can be converted to. */
    tokenList: (ERC20Token | NativeToken)[];
    /** Farmer's silo balances */
    siloBalances: FarmerSilo['balances'];
    beanstalk: BeanstalkReplanted;
    handleQuote: QuoteHandler;
    currentSeason: BigNumber;
  }
> = ({
  tokenList,
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
  const getBDV = useBDV();

  /// Extract values from form state
  const tokenIn   = values.tokens[0].token;     // converting from token
  const amountIn  = values.tokens[0].amount;    // amount of from token
  const tokenOut  = values.tokenOut;            // converting to token
  const amountOut = values.tokens[0].amountOut; // amount of to token
  const maxAmountIn     = values.maxAmountIn;
  const canConvert      = maxAmountIn?.gt(0) || false;
  const siloBalance     = siloBalances[tokenIn.address];
  const depositedAmount = siloBalance?.deposited?.amount || ZERO_BN;
  const isQuoting = values.tokens[0].quoting || false;

  /// Derived form state
  let isReady        = false;
  let buttonLoading  = false;
  let buttonContent;
  let bdvOut;     // the BDV received after re-depositing `amountOut` of `tokenOut`.
  let deltaBDV;   // the change in BDV during the convert. should always be >= 0.
  let deltaStalk; // the change in Stalk during the convert. should always be >= 0.
  let deltaSeedsPerBDV; // change in seeds per BDV for this pathway. ex: bean (2 seeds) -> bean:3crv (4 seeds) = +2 seeds.
  let deltaSeeds; // the change in seeds during the convert.

  ///
  const [conversion, setConversion] = useState(INIT_CONVERSION);
  const runConversion = useCallback((_amountIn: BigNumber) => {
    if (!tokenOut) {
      setConversion(INIT_CONVERSION);
    } else if (tokenOut && !isQuoting) {
      console.debug('[Convert] setting conversion, ', tokenOut, isQuoting);
      setConversion(
        Beanstalk.Silo.Convert.convert(
          tokenIn,   // from
          tokenOut,  // to
          _amountIn, // amount
          siloBalance?.deposited?.crates, // depositedCrates
          currentSeason,
        )
      );
    }
  }, [currentSeason, isQuoting, siloBalance?.deposited?.crates, tokenIn, tokenOut]);

  /// FIXME: is there a better pattern for this?
  /// we want to refresh the conversion info only
  /// when the quoting is complete and amountOut
  /// has been updated respectively. if runConversion
  /// depends on amountIn it will run every time the user
  /// types something into the input.
  useEffect(() => {
    runConversion(amountIn || ZERO_BN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountOut, runConversion]);

  /// Change button state and prepare outputs
  if (depositedAmount.eq(0)) {
    buttonContent = 'Nothing to convert';
  } else if (values.maxAmountIn === null) {
    if (values.tokenOut) {
      buttonContent = 'Refreshing convert data...';
      buttonLoading = false;
    } else {
      buttonContent = 'No output selected';
      buttonLoading = false;
    }
  } else if (!canConvert) {
    buttonContent = 'Pathway unavailable';
  } else  {
    buttonContent = 'Convert';
    if (tokenOut && amountOut?.gt(0)) {
      isReady    = true;
      bdvOut     = getBDV(tokenOut).times(amountOut);
      deltaBDV   = (
        bdvOut
          .minus(conversion.bdv.abs())
      );
      deltaStalk = (
        tokenOut.getStalk(deltaBDV)
      );
      deltaSeedsPerBDV = (
        tokenOut.getSeeds()
          .minus(tokenIn.getSeeds())
      );
      deltaSeeds = (
        tokenOut.getSeeds(bdvOut)  // seeds for depositing this token with new BDV
          .minus(conversion.seeds.abs())   // seeds lost when converting
      );
    }
  }
  
  /// When a new output token is selected, reset maxAmountIn.
  const handleSelectTokenOut = useCallback(async (_tokens: Set<Token>) => {
    const arr = Array.from(_tokens);
    if (arr.length !== 1) throw new Error();
    const _tokenOut = arr[0];
    /// only reset if the user clicked a different token
    if (tokenOut !== _tokenOut) {
      setFieldValue('tokenOut', _tokenOut);
      setFieldValue('maxAmountIn', null);
    }
  }, [setFieldValue, tokenOut]);

  /// When `tokenIn` or `tokenOut` changes, refresh the
  /// max amount that the user can input of `tokenIn`.
  useEffect(() => {
    (async () => {
      if (tokenOut) {
        const _maxAmountIn = (
          await beanstalk.getMaxAmountIn(
            tokenIn.address,
            tokenOut.address,
          )
          .then(tokenResult(tokenIn))
          .catch(() => ZERO_BN) // if calculation fails, consider this pathway unavailable
        );
        setFieldValue('maxAmountIn', _maxAmountIn);
      }
    })();
  }, [beanstalk, setFieldValue, tokenIn, tokenOut]);

  const conversionPct = (amountIn && maxAmountIn) ? amountIn.div(maxAmountIn) : null;

  return (
    <Form noValidate autoComplete="off">
      <TokenSelectDialog
        open={isTokenSelectVisible}
        handleClose={hideTokenSelect}
        handleSubmit={handleSelectTokenOut}
        selected={values.tokens}
        tokenList={tokenList}
        mode={TokenSelectMode.SINGLE}
      />
      <Stack gap={1}>
        {/* Input token */}
        <TokenQuoteProvider
          name="tokens.0"
          tokenOut={(tokenOut || tokenIn) as ERC20Token}
          max={MinBN(values.maxAmountIn || ZERO_BN, depositedAmount)}
          balance={depositedAmount}
          balanceLabel="Deposited Balance"
          state={values.tokens[0]}
          handleQuote={handleQuote}
          tokenSelectLabel={`Deposited ${tokenIn.symbol}`}
          disabled={(
            !values.maxAmountIn         // still loading `maxAmountIn`
            || values.maxAmountIn.eq(0) // = 0 means we can't make this conversion
          )}
        />
        {/* Output token */}
        {depositedAmount.gt(0) ? (
          <PillRow
            isOpen={isTokenSelectVisible}
            label="Convert to"
            onClick={showTokenSelect}
          >
            {tokenOut ? <TokenIcon token={tokenOut} /> : null}
            <Typography>{tokenOut?.name || 'Select token'}</Typography>
          </PillRow>
        ) : null}
        {(amountIn && tokenOut && maxAmountIn && amountOut?.gt(0)) ? (
          <>
            <TxnSeparator mt={-1} />
            <TokenOutputField
              token={tokenOut}
              amount={amountOut || ZERO_BN}
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
                      Converting from {tokenIn.symbol} to {tokenOut.symbol} results in {(
                        (!deltaSeedsPerBDV || deltaSeedsPerBDV.eq(0)) 
                          ? 'no change in SEEDS per BDV'
                          : `a ${deltaSeedsPerBDV.gt(0) ? 'gain' : 'loss'} of ${deltaSeedsPerBDV.abs().toString()} SEEDS per BDV`
                      )}.
                    </>
                  )}
                />
              </Box>
            </Stack>
            {(conversionPct && conversionPct.gt(0.9)) ? (
              <Box>
                <Alert color="warning" icon={<WarningAmberIcon sx={{ fontSize: 22 }} />}>
                  You are converting {displayFullBN(conversionPct.times(100), 4, 0)}% of the way to the peg. 
                  When Converting all the way to the peg, the Convert may fail due to a small amount of slippage in the direction of the peg.
                </Alert>
              </Box>
            ) : null}
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={conversion.actions}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
        ) : null}
        <LoadingButton
          loading={buttonLoading || isQuoting}
          loadingPosition={
            isSubmitting
              ? 'center'  // when submitting, hide the button text
              : 'start'   // when loading convert data, show button text
          }
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={!isReady || isSubmitting}
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

  /// Token List
  const [tokenList, initialTokenOut] = useMemo(() => {
    const allTokens = (fromToken === urBean || fromToken === urBeanCrv3)
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
  }, [urBean, urBeanCrv3, Bean, BeanCrv3, fromToken]);

  /// Beanstalk
  const season = useSeason();

  /// Farmer
  const siloBalances            = useFarmerSiloBalances();
  const [refetchFarmerSilo]     = useFetchFarmerSilo();

  /// Network
  const { data: signer }  = useSigner();
  const beanstalk         = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  // const provider          = useProvider();
  // const farm              = useMemo(() => new Farm(provider), [provider]);

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
        amount:     undefined,
        quoting:    false,
        amountOut:  undefined,
      },
    ],
    // Convert data
    maxAmountIn:    undefined,
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
      formActions.resetForm({
        values: {
          ...initialValues,
          tokenOut: undefined,
        }
      });
    } catch (err) {
      console.error(err);
      txToast ? txToast.error(err) : toast.error(parseError(err));
      formActions.setSubmitting(false);
    }
  }, [Bean, BeanCrv3, urBean, urBeanCrv3, beanstalk, initialValues, refetchFarmerSilo, season, siloBalances]);

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
