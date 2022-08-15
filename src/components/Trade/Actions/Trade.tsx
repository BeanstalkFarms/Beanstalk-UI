import { Alert, CircularProgress, IconButton, Link, Stack } from '@mui/material';
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
import useChainConstant from '~/hooks/useChainConstant';

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

enum Pathway {
  TRANSFER,
  ETH_WETH,
  BEAN_ETH,
  BEAN_WETH, // make this BEAN_TRICRYPTO_UNDERLYING
  BEAN_CRV3_UNDERLYING,
}

const Quoting = <CircularProgress variant="indeterminate" size="small" sx={{ width: 14, height: 14 }} />;

const QUOTE_SETTINGS = {
  ignoreSameToken: false
};

const TradeForm: React.FC<FormikProps<TradeFormValues> & {
  balances: ReturnType<typeof useFarmerBalances>;
  beanstalk: Beanstalk;
  handleQuote: DirectionalQuoteHandler;
  tokenList: (ERC20Token | NativeToken)[];
  getPathway: (tokenIn: Token, tokenOut: Token) => Pathway | false;
}> = ({
  //
  values,
  setFieldValue,
  handleQuote,
  isSubmitting,
  //
  balances,
  beanstalk,
  tokenList,
  getPathway
}) => {
  /// Tokens
  const Eth = useChainConstant(ETH);
  
  /// Derived values
  // Inputs
  const stateIn   = values.tokensIn[0];
  const tokenIn   = stateIn.token;
  const modeIn    = values.modeIn;
  const amountIn  = stateIn.amount;
  const balanceIn = balances[tokenIn.address];
  // Outputs
  const stateOut  = values.tokenOut;
  const tokenOut  = stateOut.token;
  const modeOut   = values.modeOut;
  const amountOut = stateOut.amount;
  // const balanceOut = balances[tokenOut.address];
  // Other
  const tokensMatch = tokenIn === tokenOut;
  const noBalance = !(balanceIn?.total.gt(0));

  /// Memoize to prevent infinite loop on useQuote
  const handleBackward = useMemo(() => handleQuote('backward'), [handleQuote]);
  const handleForward  = useMemo(() => handleQuote('forward'),  [handleQuote]);
  const [resultIn,  quotingIn,  getMinAmountIn] = useQuote(tokenIn, handleBackward, QUOTE_SETTINGS);
  const [resultOut, quotingOut, getAmountOut]   = useQuote(tokenOut, handleForward, QUOTE_SETTINGS);

  /// When receiving new results from quote handlers, update
  /// the respective form fields.
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

  /// Token Select
  const [tokenSelect, setTokenSelect] =  useState<null | 'tokensIn' | 'tokenOut'>(null);
  const selectedTokens = (
    tokenSelect === 'tokenOut' 
      ? [tokenOut] 
      : tokenSelect === 'tokensIn'
      ? values.tokensIn.map((x) => x.token)
      : []
  );
  const handleCloseTokenSelect = useCallback(() => setTokenSelect(null), []);
  const handleShowTokenSelect  = useCallback((which: 'tokensIn' | 'tokenOut') => () => setTokenSelect(which), []);
  
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

  const handleReverse = useCallback(() => {
    if (tokensMatch) {
      /// Flip destinations.
      setFieldValue('modeIn', modeOut);
      setFieldValue('modeOut', modeIn);
    } else {
      setFieldValue('tokensIn.0', {
        token: tokenOut,
        amount: undefined,
      } as TradeFormValues['tokensIn'][number]);
      setFieldValue('tokenOut', {
        token: tokenIn,
        amount: undefined,
      });
    }
  }, [modeIn, modeOut, setFieldValue, tokenIn, tokenOut, tokensMatch]);
  
  const pathwayCheck = (
    getPathway(tokenIn, tokenOut) !== false
  );
  /// If ETH is selected as an output, the only possible destination is EXTERNAL.
  const ethModeCheck = (
    tokenOut === Eth
      ? (modeOut === FarmToMode.EXTERNAL)
      : true
  );
  const amountsCheck = (
    amountIn?.gt(0)
    && amountOut?.gt(0)
  );
  const isValid = (
    pathwayCheck
    && ethModeCheck
    && amountsCheck
  );

  return (
    <Form autoComplete="off">
      <TokenSelectDialog
        title={(
          tokenSelect === 'tokensIn'
            ? 'Select Input Token'
            : 'Select Output Token'
        )}
        open={tokenSelect !== null}   // 'tokensIn' | 'tokensOut'
        handleClose={handleCloseTokenSelect}     //
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
                  onClick={handleShowTokenSelect('tokensIn')}
                />
              )
            }}
            disabled={
              quotingIn
            }
            quote={
              quotingOut
                ? Quoting 
                : undefined
            }
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
        <Stack direction="row" justifyContent="center" mt={-1}>
          <IconButton onClick={handleReverse} size="small">
            <ExpandMoreIcon color="secondary" width={IconSize.xs} />
          </IconButton>
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
                  onClick={handleShowTokenSelect('tokenOut')}
                />
              )
            }}
            disabled={
              /// Disable while quoting an `amount` for the output.
              quotingOut
              /// Can't type into the output field if
              /// user has no balance of the input.
              || noBalance
            }
            quote={
              quotingIn
                ? Quoting 
                : undefined
            }
            handleChange={handleChangeAmountOut}
          />
          <DestinationField
            name="modeOut"
            label="Destination"
          />
        </>
        {/* Warnings */}
        {ethModeCheck === false ? (
          <Alert variant="standard" color="warning">
            ETH can only be delivered to your Circulating Balance.&nbsp;
            <Link
              onClick={() => {
                setFieldValue('modeOut', FarmToMode.EXTERNAL);
              }}
              sx={{ cursor: 'pointer' }}
              underline="hover"
            >
              Switch &rarr;
            </Link>
          </Alert>
        ) : null}
        {pathwayCheck === false ? (
          <Alert variant="standard" color="warning">
            Swapping from {tokenIn.symbol} to {tokenOut.symbol} is currently unsupported.
          </Alert>
        ) : null}
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
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          contract={beanstalk}
          tokens={values.tokensIn}
          mode="auto"
        >
          {noBalance ? 'Nothing to swap' : 'Swap'}
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

const Trade: React.FC<{}> = () => {
  ///
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);
  const account = useAccount();

  ///
  const getChainToken = useGetChainToken();
  const Eth           = getChainToken(ETH);
  const Weth          = getChainToken(WETH);
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

  const getPathway = useCallback((
    _tokenIn: Token,
    _tokenOut: Token,
  ) => {
    if (_tokenIn === _tokenOut) return Pathway.TRANSFER;
    if (isPair(_tokenIn, _tokenOut, [Eth, Weth])) return Pathway.ETH_WETH;
    if (isPair(_tokenIn, _tokenOut, [Bean, Eth])) return Pathway.BEAN_ETH;
    if (isPair(_tokenIn, _tokenOut, [Bean, Weth])) return Pathway.BEAN_WETH;
    if (
      (_tokenIn === Bean && crv3Underlying.has(_tokenOut as any))
      || (_tokenOut === Bean && crv3Underlying.has(_tokenIn as any))
    ) return Pathway.BEAN_CRV3_UNDERLYING;
    return false;
  }, [Bean, Eth, Weth, crv3Underlying]);

  const handleEstimate = useCallback(async (
    forward : boolean,
    amountIn : ethers.BigNumber,
    _account : string,
    _tokenIn : Token,
    _tokenOut : Token,
    _fromMode : FarmFromMode,
    _toMode : FarmToMode,
  ) => {
    console.debug('[handleEstimate]', {
      forward,
      amountIn,
      _account,
      _tokenIn,
      _tokenOut,
      _fromMode,
      _toMode,
    });

    const pathway = getPathway(_tokenIn, _tokenOut);

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

    /// Token <-> Token
    if (pathway === Pathway.TRANSFER) {
      console.debug('[handleEstimate] estimating: transferToken');
      return Farm.estimate(
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
    } 

    /// ETH <-> WETH
    if (pathway === Pathway.ETH_WETH) {
      console.debug(`[handleEstimate] estimating: ${startToken === Eth ? 'wrap' : 'unwrap'}`);
      return Farm.estimate(
        [
          startToken === Eth
            ? farm.wrapEth(_toMode)
            : farm.unwrapEth(_fromMode)
        ],
        [amountIn],
        forward,
      );
    } 

    /// BEAN <-> ETH
    if (pathway === Pathway.BEAN_ETH) {
      return Farm.estimate(
        startToken === Eth
         ? [
           farm.wrapEth(), // amountOut is exact
           ...farm.pair.WETH_BEAN(
             'WETH',
             _fromMode,
             _toMode,
           ),
         ]
         : [
           ...farm.pair.WETH_BEAN(
             'BEAN',
             _fromMode,
             FarmToMode.INTERNAL, // send WETH to INTERNAL
           ), // amountOut is not exact
           farm.unwrapEth(
             FarmFromMode.INTERNAL_TOLERANT  // unwrap WETH from INTERNAL
           ), // always goes to EXTERNAL because ETH is not ERC20 and therefore not circ. bal. compatible
         ],
       [amountIn],
       forward,
     );
    }

    /// BEAN <-> WETH
    if (pathway === Pathway.BEAN_WETH) {
      return Farm.estimate(
        startToken === Weth
          ? farm.pair.WETH_BEAN(
            'WETH',
            _fromMode,
            _toMode,
          )
          : farm.pair.WETH_BEAN(
            'BEAN',
            _fromMode,
            _toMode,
          ),
       [amountIn],
       forward,
     );
    } 

    /// BEAN <-> CRV3 Underlying
    if (pathway === Pathway.BEAN_CRV3_UNDERLYING) {
      console.debug('[handleEstimate] estimating: BEAN <-> 3CRV Underlying');
      return Farm.estimate(
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
    }

    throw new Error('Unsupported swap mode.');
  }, [Eth, Weth, farm, getPathway]);

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
            getPathway={getPathway}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Trade;
