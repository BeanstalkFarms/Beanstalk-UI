import { CircularProgress, Stack } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import toast from 'react-hot-toast';
import {
  FormApprovingState, FormTokenState,
  SlippageSettingsFragment,
  SmartSubmitButton,
  TokenAdornment,
  TokenSelectDialog,
} from '~/components/Common/Form';
import { TokenSelectMode } from '~/components/Common/Form/TokenSelectDialog';
import TokenInputField from '~/components/Common/Form/TokenInputField';
import DestinationField from '~/components/Common/Form/DestinationField';
import Token, { ERC20Token, NativeToken } from '~/classes/Token';
import { Beanstalk } from '~/generated/index';
import { ZERO_BN } from '~/constants';
import { BEAN, CRV3_UNDERLYING, DAI, ETH, USDC, USDT, WETH } from '~/constants/tokens';
import { useBeanstalkContract } from '~/hooks/useContract';
import useFarmerBalances from '~/hooks/useFarmerBalances';
import useTokenMap from '~/hooks/useTokenMap';
import { useSigner } from '~/hooks/ledger/useSigner';
import Farm, { FarmFromMode, FarmToMode } from '~/lib/Beanstalk/Farm';
import useGetChainToken from '~/hooks/useGetChainToken';
import useQuote, { QuoteHandler } from '~/hooks/useQuote';
import useFarm from '~/hooks/useFarm';
import useAccount from '~/hooks/ledger/useAccount';
import { toStringBaseUnitBN, toTokenUnitsBN, parseError } from '~/util';
import { IconSize } from '~/components/App/muiTheme';
import TransactionToast from '~/components/Common/TxnToast';
import { useFetchFarmerBalances } from '~/state/farmer/balances/updater';

type TradeFormValues = {
  /** Multiple tokens can (eventually) be swapped into tokenOut */
  tokensIn:   FormTokenState[];
  modeIn:     FarmFromMode;
  /** One output token can be selected */
  tokenOut:   FormTokenState;
  modeOut:    FarmToMode;
  approving?: FormApprovingState;
  /** */
  settings:   SlippageSettingsFragment;
};

type DirectionalQuoteHandler = (
  direction: 'forward' | 'backward',
) => QuoteHandler;

const Quoting = <CircularProgress variant="indeterminate" size="small" sx={{ width: 14, height: 14 }} />;

const QUOTE_SETTINGS = {
  ignoreSameToken: false
};

const TradeForm: React.FC<FormikProps<TradeFormValues> & {
  balances: ReturnType<typeof useFarmerBalances>;
  beanstalk: Beanstalk;
  handleQuote: DirectionalQuoteHandler;
  tokenList: (ERC20Token | NativeToken)[];
}> = ({
  //
  values,
  setFieldValue,
  handleQuote,
  //
  balances,
  beanstalk,
  tokenList,
}) => {
  const [tokenSelect, setTokenSelect] =  useState<null | 'tokensIn' | 'tokenOut'>(null);

  /// Derived values
  // Inputs
  const stateIn   = values.tokensIn[0];
  const tokenIn   = stateIn.token;
  const amountIn  = values.tokensIn[0].amount;
  const balanceIn = balances[tokenIn.address];
  // Outputs
  const stateOut  = values.tokenOut;
  const tokenOut  = stateOut.token;
  const amountOut = stateOut.amount;
  const balanceOut = balances[tokenOut.address];
  const tokensMatch = tokenIn === tokenOut;

  // Memoize to prevent infinite loop on useQuote
  const handleBackward = useMemo(() => handleQuote('backward'), [handleQuote]);
  const handleForward  = useMemo(() => handleQuote('forward'),  [handleQuote]);
  const [resultIn,  quotingIn,  getMinAmountIn] = useQuote(tokenIn, handleBackward, QUOTE_SETTINGS);
  const [resultOut, quotingOut, getAmountOut]   = useQuote(tokenOut, handleForward, QUOTE_SETTINGS);

  useEffect(() => {
    console.debug('[TokenInput] got new resultIn', resultIn);
    setFieldValue('tokensIn.0.amount', resultIn?.amountOut);
  }, [setFieldValue, resultIn]);
  useEffect(() => {
    console.debug('[TokenInput] got new resultOut', resultOut);
    setFieldValue('tokenOut.amount', resultOut?.amountOut);
  }, [setFieldValue, resultOut]);
  
  /// When amountIn changes, refresh amountOut
  /// Only refresh if amountIn was changed by user input,
  /// i.e. not by another hook
  const handleChangeAmountIn = useCallback((_amountInClamped) => {
    console.debug('[TokenInput] handleChangeAmountIn', _amountInClamped);
    if (_amountInClamped) {
      getAmountOut(tokenIn, _amountInClamped);
    } else {
      setFieldValue('tokenOut.amount', undefined);
    }
  }, [tokenIn, getAmountOut, setFieldValue]);
  const handleChangeAmountOut = useCallback((_amountOutClamped) => {
    console.debug('[TokenInput] handleChangeAmountOut', _amountOutClamped);
    if (_amountOutClamped) {
      console.debug('[TokenInput] getMinAmountIn', [tokenOut, _amountOutClamped]);
      getMinAmountIn(tokenOut, _amountOutClamped);
    } else {
      setFieldValue('tokensIn.0.amount', undefined);
    }
  }, [tokenOut, getMinAmountIn, setFieldValue]);

  ///
  const selectedTokens = (
    tokenSelect === 'tokenOut' 
      ? [tokenOut] 
      : tokenSelect === 'tokensIn'
      ? values.tokensIn.map((x) => x.token)
      : []
  );
  const handleClose = useCallback(() => setTokenSelect(null), []);
  const handleShow  = useCallback((which: 'tokensIn' | 'tokenOut') => () => setTokenSelect(which), []);
  const handleSubmit = useCallback((_tokens: Set<Token>) => {
    if (tokenSelect === 'tokenOut') {
      setFieldValue('tokenOut', {
        token: Array.from(_tokens)[0],
        amount: undefined,
      });
      setFieldValue('tokensIn.0.amount', undefined);
    } else if (tokenSelect === 'tokensIn') {
      const copy = new Set(_tokens);
      const newValue = values.tokensIn.filter((x) => {
        copy.delete(x.token);
        return _tokens.has(x.token);
      });
      setFieldValue('tokensIn', [
        ...newValue,
        ...Array.from(copy).map((_token) => ({
          token: _token,
          amount: undefined
        })),
      ]);
      setFieldValue('tokenOut.amount', undefined);
    }
  }, [setFieldValue, tokenSelect, values]);

  const isValid = true;

  return (
    <Form autoComplete="off">
      <TokenSelectDialog
        title={(
          tokenSelect === 'tokensIn'
            ? 'Select Input Token'
            : 'Select Output Token'
        )}
        open={tokenSelect !== null}   // 'tokensIn' | 'tokensOut'
        handleClose={handleClose}     //
        handleSubmit={handleSubmit}   //
        selected={selectedTokens}
        balances={balances}
        tokenList={tokenList}
        mode={TokenSelectMode.SINGLE}
      />
      <Stack gap={1}>
        {/* Input */}
        <>
          <TokenInputField
            token={tokenIn}
            balance={balanceIn || ZERO_BN}
            name="tokensIn.0.amount"
            // MUI
            fullWidth
            InputProps={{
              endAdornment: (
                <TokenAdornment
                  token={tokenIn}
                  onClick={handleShow('tokensIn')}
                />
              )
            }}
            disabled={quotingIn}
            quote={quotingOut ? Quoting : undefined}
            handleChange={handleChangeAmountIn}
          />
          {tokensMatch ? (
            <Stack gap={0.5}>
              <DestinationField
                name="modeIn"
                label="Source"
              />
            </Stack>
          ) : null}
        </>
        <Stack direction="row" justifyContent="center">
          <ExpandMoreIcon color="secondary" width={IconSize.xs} />
        </Stack>
        {/* Output */}
        <>
          <TokenInputField
            token={tokenOut}
            name="tokenOut.amount"
            // MUI
            fullWidth
            InputProps={{
              endAdornment: (
                <TokenAdornment
                  token={tokenOut}
                  onClick={handleShow('tokenOut')}
                />
              )
            }}
            disabled={quotingOut}
            quote={quotingIn ? Quoting : undefined}
            handleChange={handleChangeAmountOut}
          />
          <DestinationField
            name="modeOut"
            label="Destination"
          />
        </>
        {/* <Box>
          <Accordion variant="outlined">
            <StyledAccordionSummary title="Transaction Details" />
            <AccordionDetails>
              <TxnPreview
                actions={[
                  {
                    type: ActionType.BASE,
                    message: 'Trade!'
                  },
                ]}
              />
            </AccordionDetails>
          </Accordion>
        </Box> */}
        <SmartSubmitButton
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={!isValid}
          contract={beanstalk}
          tokens={values.tokensIn}
          mode="auto"
        >
          Trade
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const SUPPORTED_TOKENS = [
  BEAN,
  ETH,
  WETH,
  DAI,
  USDC,
  USDT,
];

/**
 * BEAN + ETH
 * ---------------
 * BEAN   -> ETH      exchange_underlying(BEAN, USDT) => exchange(USDT, WETH) => unwrapEth
 * BEAN   -> WETH     exchange_underlying(BEAN, USDT) => exchange(USDT, WETH)
 * ETH    -> BEAN     wrapEth => exchange(WETH, USDT) => exchange_underlying(USDT, BEAN)
 * WETH   -> BEAN     exchange(WETH, USDT) => exchange_underlying(USDT, BEAN)
 * 
 * BEAN + Stables
 * ---------------------
 * BEAN   -> DAI      exchange_underlying(BEAN, DAI, BEAN_METAPOOL)
 * BEAN   -> USDT     exchange_underlying(BEAN, USDT, BEAN_METAPOOL)
 * BEAN   -> USDC     exchange_underlying(BEAN, USDC, BEAN_METAPOOL)
 * BEAN   -> 3CRV     exchange(BEAN, 3CRV, BEAN_METAPOOL)
 * DAI    -> BEAN     exchange_underlying(DAI,  BEAN, BEAN_METAPOOL)
 * USDT   -> BEAN     exchange_underlying(BEAN, USDT, BEAN_METAPOOL)
 * USDC   -> BEAN     exchange_underlying(BEAN, USDC, BEAN_METAPOOL)
 * 3CRV   -> BEAN     exchange(3CRV, BEAN, BEAN_METAPOOL)
 * 
 * Internal <-> External
 * ---------------------
 * TOK-i  -> TOK-e    transferToken(TOK, self, amount, INTERNAL, EXTERNAL)
 * TOK-e  -> TOK-i    transferToken(TOK, self, amount, EXTERNAL, INTERNAL)
 * 
 * Stables
 * ---------------------
 * USDC   -> USDT     exchange(USDC, USDT, 3POOL)
 * ...etc
 */

/**
 * Ensure that both `_tokenIn` and `_tokenOut` are in `_pair`, regardless of order.
 */
const isPair = (_tokenIn : Token, _tokenOut : Token, _pair : [Token, Token]) => {
  const s = new Set(_pair);
  return s.has(_tokenIn) && s.has(_tokenOut);
};

// const isCombination = (_tokenIn : Token, _tokenOut : Token, _)

const Trade: React.FC<{}> = () => {
  ///
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);
  const account = useAccount();

  ///
  const getChainToken = useGetChainToken();
  const Eth           = getChainToken(ETH);
  const Bean          = getChainToken(BEAN);
  const crv3Underlying = useMemo(() => new Set(CRV3_UNDERLYING.map(getChainToken)), [getChainToken]);
  const tokenMap      = useTokenMap<ERC20Token | NativeToken>(SUPPORTED_TOKENS);
  const tokenList     = useMemo(() => Object.values(tokenMap), [tokenMap]);
  const farm          = useFarm();
  
  ///
  const farmerBalances = useFarmerBalances();
  const [refetchFarmerBalances] = useFetchFarmerBalances();

  // Form setup
  const initialValues: TradeFormValues = useMemo(() => ({
    tokensIn: [
      {
        token: Eth,
        amount: undefined,
      }
    ],
    modeIn: FarmFromMode.EXTERNAL,
    tokenOut: {
      token: Bean,
      amount: undefined
    },
    modeOut: FarmToMode.EXTERNAL,
    settings: {
      slippage: 0.1,
    }
  }), [Bean, Eth]);

  const handleEstimate = useCallback(async (
    forward : boolean,
    amountIn : ethers.BigNumber,
    _account : string,
    _tokenIn : Token,
    _tokenOut : Token,
    _fromMode : FarmFromMode,
    _toMode : FarmToMode,
  ) => {
    let estimate;
    console.debug('[handleEstimate]', {
      forward,
      amountIn,
      _account,
      _tokenIn,
      _tokenOut,
      _fromMode,
      _toMode,
    });

    /// Say I want to buy 1000 BEAN and I have ETH.
    /// I select ETH as the input token, BEAN as the output token.
    /// Then I type 1000 into the BEAN input.
    ///
    /// When this happens, `handleEstimate` is called
    /// with `forward = false` (since we are finding the amount of
    /// ETH needed to buy 1,000 BEAN, rather than the amount of BEAN
    /// received for a set amount of ETH). 
    /// 
    /// In this instance, `_tokenIn` is BEAN and `_tokenOut` is ETH,
    /// since we are quoting from BEAN to ETH.
    /// 
    /// If forward-quoting, then the user's selected input token (the
    /// first one that appears in the form) is the same as _tokenIn.
    /// If backward-quoting, then we flip things.
    const startToken = forward ? _tokenIn : _tokenOut;
    const Weth = getChainToken(WETH);

    if (_tokenIn === _tokenOut) {
      console.debug('[handleEstimate] estimating: transferToken');
      estimate = await Farm.estimate(
        [
          farm.transferToken(
            _tokenIn.address,
            _account,
            _fromMode,
            _toMode,
          )
        ],
        [amountIn],
        forward
      );
    } else if (isPair(_tokenIn, _tokenOut, [Eth, Weth])) {
      const method = startToken === Eth ? 'wrapEth' : 'unwrapEth';
      console.debug(`[handleEstimate] estimating: ${method}`);
      estimate = await Farm.estimate(
        [farm[method](_toMode)],
        [amountIn],
        forward,
      );
    } else if (isPair(_tokenIn, _tokenOut, [Bean, Eth])) {
      const method = startToken === Eth ? 'WETH' : 'BEAN';
      console.debug(`[handleEstimate] estimating: WETH_BEAN via ${method}`);
      estimate = await Farm.estimate(
        [
          farm.wrapEth(),
          ...farm.pair.WETH_BEAN(
            method,
            _fromMode,
            _toMode,
          ),
        ],
        [amountIn],
        forward,
      );
    } else if (
      (_tokenIn === Bean && crv3Underlying.has(_tokenOut as any))
      || (_tokenOut === Bean && crv3Underlying.has(_tokenIn as any))
    ) {
      console.debug('[handleEstimate] estimating: BEAN <-> 3CRV Underlying');
      estimate = await Farm.estimate(
        [
          farm.exchangeUnderlying(
            farm.contracts.curve.pools.beanCrv3.address,
            _tokenIn.address,
            _tokenOut.address,
            _fromMode,
            _toMode
          )
        ],
        [amountIn],
        forward,
      );
    } else {
      throw new Error('Unknown Swap mode.');
    }
    return estimate;
  }, [Bean, Eth, crv3Underlying, farm, getChainToken]);

  const handleQuote = useCallback<DirectionalQuoteHandler>(
    (direction) => async (_tokenIn, _amountIn, _tokenOut) => {
      console.debug('[handleQuote] ', {
        direction,
        _tokenIn,
        _amountIn,
        _tokenOut
      }); 
      if (!account) throw new Error('Connect a wallet first.');
      
      const amountIn = ethers.BigNumber.from(toStringBaseUnitBN(_amountIn, _tokenIn.decimals));
      const estimate = await handleEstimate(
        direction === 'forward',
        amountIn,
        account,
        _tokenIn,
        _tokenOut,
        FarmFromMode.INTERNAL_EXTERNAL,
        FarmToMode.EXTERNAL,
      );

      return {
        amountOut: toTokenUnitsBN(
          estimate.amountOut.toString(),
          _tokenOut.decimals
        ),
        steps: estimate.steps,
      };
    },
    [account, handleEstimate]
  );

  const onSubmit = useCallback(
    async (values: TradeFormValues, formActions: FormikHelpers<TradeFormValues>) => {
      let txToast;
      try {
        const stateIn = values.tokensIn[0];
        const tokenIn = stateIn.token;
        const stateOut = values.tokenOut;
        const tokenOut = stateOut.token;
        const modeOut  = values.modeOut;
        if (!stateIn.amount) throw new Error('No input amount set.');
        if (!account) throw new Error('Connect a wallet first.');
        if (!modeOut) throw new Error('No destination selected.');
        const amountIn = ethers.BigNumber.from(
          stateIn.token.stringify(stateIn.amount)
        );
        const estimate = await handleEstimate(
          true,
          amountIn,
          account,
          tokenIn,
          tokenOut,
          FarmFromMode.INTERNAL_EXTERNAL,
          /// FIXME: no such thing as "internal ETH"
          modeOut, 
        );

        txToast = new TransactionToast({
          loading: 'Swapping...',
          success: 'Success'
        });
        
        if (!estimate.steps) throw new Error('Unable to generate a transaction sequence');
        const data = Farm.encodeStepsWithSlippage(
          estimate.steps,
          values.settings.slippage / 100,
        );
        const txn = await beanstalk.farm(data, { value: estimate.value });
        txToast.confirming(txn);

        const receipt = await txn.wait();
        await Promise.all([
          refetchFarmerBalances()
        ]);
        txToast.success(receipt);
        formActions.resetForm();
      } catch (err) {
        txToast ? txToast.error(err) : toast.error(parseError(err));
        formActions.setSubmitting(false);
      }
    },
    [account, beanstalk, handleEstimate, refetchFarmerBalances]
  );

  return (
    <Formik<TradeFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<TradeFormValues>) => (
        <>
          {/* <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings> */}
          <TradeForm
            balances={farmerBalances}
            beanstalk={beanstalk}
            tokenList={tokenList}
            handleQuote={handleQuote}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Trade;
