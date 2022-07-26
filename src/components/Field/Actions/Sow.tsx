import { Accordion, AccordionDetails, Alert, Box, Link, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import {
  FormState,
  SettingInput,
  SmartSubmitButton,
  TokenOutputField,
  TokenQuoteProvider,
  TokenSelectDialog,
  TxnPreview,
  TxnSeparator,
  TxnSettings
} from 'components/Common/Form';
import { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import TransactionToast from 'components/Common/TxnToast';
import { BeanstalkReplanted } from 'generated/index';
import { ZERO_BN } from 'constants/index';
import { BEAN, ETH, PODS, WETH } from 'constants/tokens';
import { ethers } from 'ethers';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useToggle from 'hooks/display/useToggle';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import useGetChainToken from 'hooks/useGetChainToken';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import { QuoteHandler } from 'hooks/useQuote';
import useTokenMap from 'hooks/useTokenMap';
import Farm, { FarmFromMode, FarmToMode } from 'lib/Beanstalk/Farm';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayBN, displayFullBN, MinBN, parseError, toStringBaseUnitBN, toTokenUnitsBN } from 'util/index';
import { useProvider } from 'wagmi';
import { useSigner } from 'hooks/ledger/useSigner';
import toast from 'react-hot-toast';
import { useFetchFarmerField } from 'state/farmer/field/updater';
import { useFetchFarmerBalances } from 'state/farmer/balances/updater';
import podIconGreen from 'img/beanstalk/harvestable-pod-icon.svg';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import { useFetchBeanstalkField } from 'state/beanstalk/field/updater';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';
import { BeanstalkPalette, IconSize } from '../../App/muiTheme';
import IconWrapper from '../../Common/IconWrapper';
import TokenIcon from '../../Common/TokenIcon';

type SowFormValues = FormState & {
  settings: {
    slippage: number;
  },
  maxAmountIn: BigNumber | undefined;
};

const SowForm : React.FC<
  FormikProps<SowFormValues>
  & {
    handleQuote: QuoteHandler;
    balances: ReturnType<typeof useFarmerBalances>;
    beanstalk: BeanstalkReplanted;
    weather: BigNumber;
    soil: BigNumber;
    farm: Farm;
  }
> = ({
  values,
  setFieldValue,
  //
  balances,
  beanstalk,
  weather,
  soil,
  farm,
  handleQuote,
}) => {
  const [isTokenSelectVisible, showTokenSelect, hideTokenSelect] = useToggle();

  ///
  const getChainToken = useGetChainToken();
  const Bean          = getChainToken(BEAN);
  const Eth           = getChainToken<NativeToken>(ETH);
  const Weth          = getChainToken<ERC20Token>(WETH);
  const erc20TokenMap = useTokenMap<ERC20Token | NativeToken>([BEAN, ETH, WETH]);

  ///
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>((state) => state._bean.token.price);

  /// Extract values from form state
  const tokenIn   = values.tokens[0].token;     // converting from token
  const amount    = values.tokens[0].amount;    // amount of from token
  const tokenOut  = Bean;                       // converting to token
  const amountOut = values.tokens[0].amountOut; // amount of to token
  const maxAmountIn    = values.maxAmountIn;
  const tokenInBalance = balances[tokenIn.address];
  // const isQuoting = values.tokens[0].quoting || false;

  ///
  const hasSoil = soil.gt(0);
  const beans = tokenIn === Bean
    ? amount  || ZERO_BN
    : amountOut || ZERO_BN;
  const isSubmittable = hasSoil && beans?.gt(0);
  const numPods = beans.multipliedBy(weather.div(100).plus(1));
  const podLineLength = beanstalkField.podIndex.minus(beanstalkField.harvestableIndex);

  //
  const handleSelectTokens = useCallback((_tokens: Set<Token>) => {
    // If the user has typed some existing values in,
    // save them. Add new tokens to the end of the list.
    // FIXME: match sorting of erc20TokenList
    const copy = new Set(_tokens);
    const newValue = values.tokens.filter((x) => {
      copy.delete(x.token);
      return _tokens.has(x.token);
    });
    setFieldValue('tokens', [
      ...newValue,
      ...Array.from(copy).map((_token) => ({ token: _token, amount: undefined })),
    ]);
  }, [values.tokens, setFieldValue]);

  /// When `tokenIn` or `tokenOut` changes, refresh the
  /// max amount that the user can input of `tokenIn`.
  useEffect(() => {
    (async () => {
      if (hasSoil) {
        if (tokenIn === Bean) {
          /// 1 SOIL is consumed by 1 BEAN
          setFieldValue('maxAmountIn', soil);
        } else if (tokenIn === Eth || tokenIn === Weth) {
          /// Estimate how many ETH it will take to buy `soil` BEAN.
          /// TODO: across different forms of `tokenIn`.
          /// This (obviously) only works for Eth and Weth.
          const estimate = await Farm.estimate(
            farm.buyBeans(),
            [ethers.BigNumber.from(Bean.stringify(soil))],
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
  }, [Bean, Eth, Weth, beanstalk, hasSoil, farm, setFieldValue, soil, tokenIn, tokenOut]);

  const maxAmountUsed = (amount && maxAmountIn) ? amount.div(maxAmountIn) : null;

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
        {/* <div>Soil: {soil.toString()} Max amount in: {values.maxAmountIn?.toString() || 'none'}</div> */}
        <TokenQuoteProvider
          key="tokens.0"
          name="tokens.0"
          tokenOut={Bean}
          disabled={!hasSoil || !values.maxAmountIn}
          max={MinBN(values.maxAmountIn || ZERO_BN, tokenInBalance?.total || ZERO_BN)}
          balance={tokenInBalance || undefined}
          state={values.tokens[0]}
          showTokenSelect={showTokenSelect}
          handleQuote={handleQuote}
        />
        {!hasSoil ? (
          <Box>
            <Alert color="warning" icon={<IconWrapper boxSize={IconSize.medium}><WarningAmberIcon sx={{ fontSize: IconSize.small }} /></IconWrapper>}>
              There is currently no Soil. <Link href="https://docs.bean.money/farm/field#soil" target="_blank" rel="noreferrer">Learn more</Link>
            </Alert>
          </Box>
        ) : null}
        {isSubmittable ? (
          <>
            <TxnSeparator />
            <TokenOutputField
              token={PODS}
              amount={numPods}
              override={(
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <TokenIcon
                    token={PODS}
                    style={{
                      height: IconSize.small,
                    }}
                  />
                  <Typography variant="bodyMedium">
                    {PODS.symbol} @ {displayBN(podLineLength)}
                  </Typography>
                </Stack>
              )}
            />
            <Box
              sx={{
                py: 1,
                backgroundColor: BeanstalkPalette.washedGreen,
                borderRadius: 1
            }}
            >
              <Typography variant="body1" textAlign="center" color="primary" alignItems="center">Upon <strong>Harvest</strong>, <span><img src={podIconGreen} alt="" height={IconSize.xs} /></span> {displayBN(numPods)} will be redeemable for <span><img src={beanIcon} alt="" height={IconSize.xs} /></span> {displayBN(numPods)}</Typography>
            </Box>
            {(maxAmountUsed && maxAmountUsed.gt(0.9)) ? (
              <Box>
                <Alert
                  color="warning"
                  icon={<IconWrapper boxSize={IconSize.medium}><WarningAmberIcon sx={{ fontSize: IconSize.small }} /></IconWrapper>}
                >
                  You are Sowing {displayFullBN(maxAmountUsed.times(100), 4, 0)}% of remaining Soil. 
                </Alert>
              </Box>
            ) : null}
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BUY_BEANS,
                        beanAmount: beans,
                        beanPrice: beanPrice,
                        token: tokenIn,
                        tokenAmount: amount || ZERO_BN
                      },
                      {
                        type: ActionType.BURN_BEANS,
                        amount: beans
                      },
                      {
                        type: ActionType.RECEIVE_PODS,
                        podAmount: numPods,
                        placeInLine: podLineLength
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
          contract={beanstalk}
          tokens={values.tokens}
          mode="auto"
        >
          Sow
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

const Sow : React.FC<{}> = () => {
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

  /// Data
  const weather = useSelector<AppState, AppState['_beanstalk']['field']['weather']['yield']>((state) => state._beanstalk.field.weather.yield);
  const soil    = useSelector<AppState, AppState['_beanstalk']['field']['soil']>((state) => state._beanstalk.field.soil);
  
  /// Refetchers
  const balances                = useFarmerBalances();
  const [refetchBeanstalkField] = useFetchBeanstalkField();
  const [refetchFarmerField]    = useFetchFarmerField();
  const [refetchFarmerBalances] = useFetchFarmerBalances();

  /// Form setup
  const initialValues : SowFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1, // 0.1%
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
  // This handler does not run when _tokenIn = _tokenOut
  // _tokenOut === Bean 
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
        throw new Error(`Sowing from ${tokenIn.symbol} is not currently supported`);
      }
      
      return {
        amountOut: toTokenUnitsBN(estimate.amountOut.toString(), tokenOut.decimals),
        steps: estimate.steps,
      };
    },
    [farm, Weth]
  );

  const onSubmit = useCallback(async (values: SowFormValues, formActions: FormikHelpers<SowFormValues>) => {
    let txToast;
    try {
      const formData = values.tokens[0];
      const inputToken = formData.token;
      const amountBeans = inputToken === Bean ? formData.amount : formData.amountOut;
      if (values.tokens.length > 1) throw new Error('Only one token supported at this time');
      if (!amountBeans || amountBeans.eq(0)) throw new Error('No amount set');
      
      const data : string[] = [];
      const amountPods = amountBeans.times(weather.div(100).plus(1));
      let value = ZERO_BN;
      
      txToast = new TransactionToast({
        loading: `Sowing ${displayFullBN(amountBeans, Bean.decimals)} Beans for ${displayFullBN(amountPods, PODS.decimals)} Pods`,
        success: 'Sow complete.',
      });
      
      /// Sow directly from BEAN
      if (inputToken === Bean) {
        // Nothing to do
      } 
      
      /// Swap to BEAN and Sow
      else {
        // Require a quote
        if (!formData.steps || !formData.amountOut) throw new Error(`No quote available for ${formData.token.symbol}`);

        if (inputToken === Eth) {
          if (!formData.amount) throw new Error('No amount set');
          value = value.plus(formData.amount);
          data.push(beanstalk.interface.encodeFunctionData('wrapEth', [
            toStringBaseUnitBN(value, Eth.decimals),
            FarmToMode.INTERNAL,
          ]));
        }

        // Encode steps to get from token i to siloToken
        const encoded = Farm.encodeStepsWithSlippage(
          formData.steps,
          values.settings.slippage / 100,
        );
        data.push(...encoded);
        encoded.forEach((_data, index) => 
          console.debug(`[Deposit] step ${index}:`, formData.steps?.[index]?.decode(_data).map((elem) => (elem instanceof ethers.BigNumber ? elem.toString() : elem)))
        );
      }
      
      data.push(
        beanstalk.interface.encodeFunctionData('sow', [
          toStringBaseUnitBN(amountBeans, Bean.decimals),
          FarmFromMode.INTERNAL_EXTERNAL,
        ])
      );
 
      const txn = await beanstalk.farm(data, { value: toStringBaseUnitBN(value, Eth.decimals) });
      txToast.confirming(txn);
      
      const receipt = await txn.wait();
      await Promise.all([
        refetchFarmerField(),     // get farmer's plots
        refetchFarmerBalances(),  // get farmer's token balances
        refetchBeanstalkField(),  // get beanstalk field data (ex. amount of Soil left)
      ]);  
      txToast.success(receipt);
      formActions.resetForm();
    } catch (err) {
      console.error(err);
      txToast?.error(err) || toast.error(parseError(err));
    } finally {
      formActions.setSubmitting(false);
    }
  }, [
    beanstalk,
    weather,
    Bean,
    Eth,
    refetchFarmerField,
    refetchFarmerBalances,
    refetchBeanstalkField,
  ]);

  return (
    <Formik<SowFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<SowFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <SowForm
            handleQuote={handleQuote}
            balances={balances}
            beanstalk={beanstalk}
            weather={weather}
            soil={soil}
            farm={farm}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Sow;
