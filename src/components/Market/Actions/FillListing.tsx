import { Accordion, AccordionDetails, Box, Stack, Typography } from '@mui/material';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import {
  FormState,
  SettingInput, SlippageSettingsFragment, SmartSubmitButton, TokenOutputField,
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
import { displayBN, displayTokenAmount, MinBN, toStringBaseUnitBN, parseError, toTokenUnitsBN } from 'util/index';
import useToggle from 'hooks/display/useToggle';
import useGetChainToken from 'hooks/useGetChainToken';
import { ethers } from 'ethers';
import Farm, { FarmFromMode, FarmToMode } from 'lib/Beanstalk/Farm';
import { useSigner } from 'hooks/ledger/useSigner';
import { useProvider } from 'wagmi';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated';
import { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import { ActionType } from 'util/Actions';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import BigNumber from 'bignumber.js';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import TransactionToast from 'components/Common/TxnToast';
import { useFetchBeanstalkField } from 'state/beanstalk/field/updater';
import { useFetchFarmerField } from 'state/farmer/field/updater';
import { useFetchFarmerBalances } from 'state/farmer/balances/updater';
import toast from 'react-hot-toast';
import { PodListing } from 'state/farmer/market';

export type FillListingFormValues = FormState & {
  settings: SlippageSettingsFragment;
  maxAmountIn: BigNumber | undefined;
}

const FillListingForm : React.FC<
  FormikProps<FillListingFormValues>
  & {
    podListing: PodListing;
    contract: BeanstalkReplanted;
    handleQuote: QuoteHandler;
    farm: Farm;
  }
> = ({
  // Formik
  values,
  setFieldValue,
  //
  podListing,
  contract,
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
  const isSubmittable = isReady;
  const podsPurchased = amountOut?.div(podListing.pricePerPod) || ZERO_BN;

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
            values.maxAmountIn    || ZERO_BN,
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
            {/* Place in Line */}
            <Stack direction="row" justifyContent="space-between" sx={{ p: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Place in Pod Line
              </Typography>
              <Typography variant="body1">
                {displayBN(podListing.index.minus(beanstalkField.harvestableIndex))}
              </Typography>
            </Stack>
            {/* Pods Output */}
            <TokenOutputField
              token={PODS}
              amount={podsPurchased}
              amountTooltip={(
                <>
                  {displayTokenAmount(amountOut || ZERO_BN, Bean)} / {displayBN(podListing.pricePerPod)} Beans per Pod<br />= {displayTokenAmount(podsPurchased, PODS)}
                </>
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
        <SmartSubmitButton
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={!isSubmittable}
          contract={contract}
          tokens={values.tokens}
          mode="auto"
        >
          Buy Pods
        </SmartSubmitButton>
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

  /// Refetchers
  // const balances                = useFarmerBalances();
  const [refetchBeanstalkField] = useFetchBeanstalkField();
  const [refetchFarmerField]    = useFetchFarmerField();
  const [refetchFarmerBalances] = useFetchFarmerBalances();

  ///
  const initialValues: FillListingFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1
    },
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

  const onSubmit = useCallback(async (values: FillListingFormValues, formActions: FormikHelpers<FillListingFormValues>) => {
    let txToast;
    try {
      console.debug('Pod listing:', await beanstalk.podListing(podListing.id), podListing.id);
      const formData = values.tokens[0];
      const inputToken = formData.token;
      const amountBeans = inputToken === Bean ? formData.amount : formData.amountOut;
      if (!podListing) throw new Error('No pod listing.');
      if (!signer) throw new Error('Connect a wallet that can sign transactions first.');
      if (values.tokens.length > 1) throw new Error('Only one token supported at this time');
      if (!formData.amount || !amountBeans || amountBeans.eq(0)) throw new Error('No amount set');
      
      const data : string[] = [];
      const amountPods = amountBeans.div(podListing.pricePerPod);
      let value = ZERO_BN;
      
      txToast = new TransactionToast({
        loading: `Purchase ${displayTokenAmount(amountPods, PODS)} Pods for ${displayTokenAmount(amountBeans, Bean)}`,
        success: 'Purchase complete.',
      });
      
      /// Sow directly from BEAN
      if (inputToken === Bean) {
        // Nothing to do
      } 
      
      /// Swap to BEAN and buy
      else {
        // Require a quote
        if (!formData.steps || !formData.amountOut) throw new Error(`No quote available for ${formData.token.symbol}`);

        if (inputToken === Eth) {
          value = value.plus(formData.amount);
          data.push(beanstalk.interface.encodeFunctionData('wrapEth', [
            toStringBaseUnitBN(value, Eth.decimals),
            FarmToMode.INTERNAL,
          ]));
        }

        const encoded = Farm.encodeStepsWithSlippage(
          formData.steps,
          values.settings.slippage / 100,
        );
        data.push(...encoded);
      }
      
      data.push(
        beanstalk.interface.encodeFunctionData('fillPodListing', [
          {
            // account: string;
            // index: BigNumberish;
            // start: BigNumberish;
            // amount: BigNumberish;
            // pricePerPod: BigNumberish;
            // maxHarvestableIndex: BigNumberish;
            // mode: BigNumberish;
            account:  podListing.account,
            index:    Bean.stringify(podListing.index),
            start:    Bean.stringify(podListing.start),
            amount:   Bean.stringify(podListing.amount),
            pricePerPod: Bean.stringify(podListing.pricePerPod),
            maxHarvestableIndex: Bean.stringify(podListing.maxHarvestableIndex),
            mode:     podListing.mode,
          },
          Bean.stringify(amountBeans),
          FarmFromMode.INTERNAL_EXTERNAL,
        ])
      );
 
      const overrides = { value: toStringBaseUnitBN(value, Eth.decimals) };
      const txn = data.length === 1
        ? await provider.sendTransaction(
          signer.signTransaction({
            to: beanstalk.address,
            data: data[0],
            ...overrides
          })
        )
        : await beanstalk.farm(data, overrides);
      txToast.confirming(txn);
      
      const receipt = await txn.wait();
      await Promise.all([
        refetchFarmerField(),     // get farmer's plots
        refetchFarmerBalances(),  // get farmer's token balances
        refetchBeanstalkField(),  // get beanstalk field data (ex. amount of Soil left)
        // FIXME: refresh listings
      ]);  
      txToast.success(receipt);
      formActions.resetForm();
    } catch (err) {
      console.error(err);
      txToast?.error(err) || toast.error(parseError(err));
    } finally {
      formActions.setSubmitting(false);
    }
  }, [Bean, Eth, beanstalk, podListing, provider, signer, refetchBeanstalkField, refetchFarmerBalances, refetchFarmerField]);

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
            contract={beanstalk}
            farm={farm}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default FillListing;
