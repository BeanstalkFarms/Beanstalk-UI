import { Accordion, AccordionDetails, Box, Button, Stack, Typography } from '@mui/material';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import {
  FormState,
  SettingInput, TokenOutputField,
  TokenQuoteProvider,
  TokenSelectDialog, TxnPreview, TxnSeparator,
  TxnSettings
} from 'components/Common/Form';
import { SupportedChainId, ZERO_BN } from 'constants/index';
import { BEAN, ETH, PODS, WETH } from 'constants/tokens';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useChainId from 'hooks/useChain';
import useFarmerBalances from 'hooks/useFarmerBalances';
import { QuoteHandler } from 'hooks/useQuote';
import useTokenMap from 'hooks/useTokenMap';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayBN, MinBN, toStringBaseUnitBN, toTokenUnitsBN } from 'util/index';
import useToggle from 'hooks/display/useToggle';
import useGetChainToken from 'hooks/useGetChainToken';
import { ethers } from 'ethers';
import Farm from 'lib/Beanstalk/Farm';
import { useSigner } from 'hooks/ledger/useSigner';
import { useProvider } from 'wagmi';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated';
import { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import { ActionType } from 'util/Actions';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import BigNumber from 'bignumber.js';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import { PodListing } from '../Plots.mock';

export type FillListingFormValues = FormState & {
  maxAmountIn: BigNumber | undefined;
}

const FillListingForm : React.FC<
  FormikProps<FillListingFormValues>
  & {
    podListing: PodListing;
    handleQuote: QuoteHandler;
    farm: Farm;
  }
> = ({
  // Formik
  values,
  setFieldValue,
  //
  podListing,
  handleQuote,
  farm,
}) => {
  const [isTokenSelectVisible, handleOpen, hideTokenSelect] = useToggle();
  
  /// Chain
  const chainId       = useChainId();
  const getChainToken = useGetChainToken();
  const Bean          = getChainToken(BEAN);
  const Eth           = getChainToken<NativeToken>(ETH);
  const Weth          = getChainToken<ERC20Token>(WETH);
  const erc20TokenMap = useTokenMap<ERC20Token | NativeToken>([BEAN, ETH, WETH]);

  /// FIXME: bump up to form parent ??
  const balances       = useFarmerBalances();
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  /// Derived
  const isMainnet = chainId === SupportedChainId.MAINNET;
  const tokenIn   = values.tokens[0].token;
  const amountIn  = values.tokens[0].amount;
  const tokenOut  = Bean;
  const amountOut = (tokenIn === tokenOut) // Beans
    ? values.tokens[0].amount
    : values.tokens[0].amountOut;
  const tokenInBalance = balances[tokenIn.address];

  /// Calculations
  const isReady = amountOut?.gt(0);

  /// Token select
  const handleSelectTokens = useCallback((_tokens: Set<Token>) => {
    // If the user has typed some existing values in,
    // save them. Add new tokens to the end of the list.
    // FIXME: match sorting of erc20TokenList
    const copy = new Set(_tokens);
    const v = values.tokens.filter((x) => {
      copy.delete(x.token);
      return _tokens.has(x.token);
    });
    setFieldValue('tokens', [
      ...v,
      ...Array.from(copy).map((_token) => ({
        token: _token,
        amount: undefined
      })),
    ]);
  }, [values.tokens, setFieldValue]);

  /// FIXME: standardized `maxAmountIn` approach?
  /// When `tokenIn` or `tokenOut` changes, refresh the
  /// max amount that the user can input of `tokenIn`.
  useEffect(() => {
    (async () => {
      console.debug('exec');
      const maxBeans = podListing.remainingAmount.times(podListing.pricePerPod);
      if (maxBeans.gt(0)) {
        if (tokenIn === Bean) {
          /// 1 POD is consumed by 1 BEAN
          setFieldValue('maxAmountIn', maxBeans);
        } else if (tokenIn === Eth || tokenIn === Weth) {
          /// Estimate how many ETH it will take to buy `maxBeans` BEAN. 
          /// TODO: across different forms of `tokenIn`.
          /// This (obviously) only works for Eth and Weth.
          const estimate = await Farm.estimate(
            farm.buyBeans(),
            [ethers.BigNumber.from(Bean.stringify(maxBeans))],
            false, // forward = false -> run the calc backwards
          );
          setFieldValue(
            'maxAmountIn',
            toTokenUnitsBN(
              estimate.amountOut.toString(), 
              tokenIn.decimals
            ),
          );
        } else {
          throw new Error(`Unsupported tokenIn: ${tokenIn.symbol}`);
        }
      } else {
        setFieldValue('maxAmountIn', ZERO_BN);
      }
    })();
  }, [Bean, Eth, Weth, farm, podListing.pricePerPod, podListing.remainingAmount, setFieldValue, tokenIn]);

  return (
    <Form autoComplete="off">
      <TokenSelectDialog
        open={isTokenSelectVisible}
        handleClose={hideTokenSelect}
        handleSubmit={handleSelectTokens}
        selected={values.tokens}
        balances={balances}
        tokenList={Object.values(erc20TokenMap)}
        mode={TokenSelectMode.SINGLE}
      />
      <Stack gap={1}>
        <TokenQuoteProvider
          key="tokens.0"
          name="tokens.0"
          tokenOut={Bean}
          disabled={!values.maxAmountIn}
          max={MinBN(
            values.maxAmountIn || ZERO_BN,
            tokenInBalance?.total || ZERO_BN
          )}
          balance={tokenInBalance || undefined}
          state={values.tokens[0]}
          showTokenSelect={handleOpen}
          handleQuote={handleQuote}
        />
        {isReady ? (
          <>
            <TxnSeparator mt={0} />
            <Stack direction="row" justifyContent="space-between" sx={{ p: 1 }}>
              <Typography variant="body1" color="text.secondary">Place in Pod Line</Typography>
              <Typography variant="body1">
                {displayBN(podListing.index.minus(beanstalkField.harvestableIndex))}
              </Typography>
            </Stack>
            <TokenOutputField
              token={PODS}
              amount={podListing.remainingAmount}
              isLoading={false}
            />
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BASE,
                        message: 'DO SOMETHING'
                      },
                      {
                        type: ActionType.BASE,
                        message: 'DO SOMETHING!'
                      }
                    ]}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
        ) : null}
        <Button sx={{ p: 1, height: '60px' }} type="submit" disabled>
          Buy Pods
        </Button>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const PREFERRED_TOKENS : PreferredToken[] = [
  {
    token: BEAN,
    minimum: new BigNumber(1),    // $1
  },
  {
    token: ETH,
    minimum: new BigNumber(0.001) // ~$2-4
  },
  {
    token: WETH,
    minimum: new BigNumber(0.001) // ~$2-4
  }
];

const FillListing : React.FC<{
  podListing: PodListing
}> = ({
  podListing
}) => {
  /// Form
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  
  /// Tokens
  const getChainToken = useGetChainToken();
  const Bean          = getChainToken(BEAN);
  const Eth           = getChainToken(ETH);
  const Weth          = getChainToken(WETH);
  
  /// Ledger
  const { data: signer } = useSigner();
  const provider  = useProvider();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farm      = useMemo(() => new Farm(provider), [provider]);

  ///
  const initialValues: FillListingFormValues = useMemo(() => ({
    tokens: [
      {
        token: baseToken as (ERC20Token | NativeToken),
        amount: undefined,
      },
    ],
    maxAmountIn: undefined,
  }), [baseToken]);

  /// Handlers
  const handleQuote = useCallback<QuoteHandler>(
    async (_tokenIn, _amountIn, _tokenOut) => {
      const tokenIn  : ERC20Token = _tokenIn  instanceof NativeToken ? Weth : _tokenIn;
      const tokenOut : ERC20Token = _tokenOut instanceof NativeToken ? Weth : _tokenOut;
      const amountIn = ethers.BigNumber.from(toStringBaseUnitBN(_amountIn, tokenIn.decimals));
      let estimate;

      // Depositing BEAN
      if (tokenIn === Weth) {
        estimate = await Farm.estimate(
          farm.buyBeans(), // this assumes we're coming from WETH
          [amountIn]
        );
      } else {
        throw new Error(`Filling a Listing via ${tokenIn.symbol} is not currently supported`);
      }
      
      return {
        amountOut: toTokenUnitsBN(estimate.amountOut.toString(), tokenOut.decimals),
        steps: estimate.steps,
      };
    },
    [Weth, farm]
  );

  const onSubmit = useCallback((values: FillListingFormValues, formActions: FormikHelpers<FillListingFormValues>) => {
    Promise.resolve();
  }, []);

  return (
    <Formik<FillListingFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<FillListingFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <FillListingForm
            podListing={podListing}
            handleQuote={handleQuote}
            farm={farm}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default FillListing;
