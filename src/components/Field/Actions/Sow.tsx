import { Stack } from '@mui/material';
import BigNumber from 'bignumber.js';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import { FormState, SettingInput, SmartSubmitButton, TokenOutputField, TokenQuoteProvider, TokenSelectDialog, TxnSeparator, TxnSettings } from 'components/Common/Form';
import { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import TransactionToast from 'components/Common/TxnToast';
import { BeanstalkReplanted } from 'constants/generated';
import { ZERO_BN } from 'constants/index';
import { BEAN, ETH, PODS, WETH } from 'constants/tokens';
import { ethers } from 'ethers';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useToggle from 'hooks/display/useToggle';
import useChainId from 'hooks/useChain';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import useGetChainToken from 'hooks/useGetChainToken';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import { QuoteHandler } from 'hooks/useQuote';
import useTokenMap from 'hooks/useTokenMap';
import Farm, { FarmFromMode, FarmToMode } from 'lib/Beanstalk/Farm';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayFullBN, toStringBaseUnitBN, toTokenUnitsBN } from 'util/index';
import { useProvider, useSigner } from 'wagmi';

type SowFormValues = FormState & {
  settings: {
    slippage: number;
  }
};

const SowForm : React.FC<
  FormikProps<SowFormValues>
  & {
    balances: ReturnType<typeof useFarmerBalances>;
    beanstalk: BeanstalkReplanted;
    weather: BigNumber;
    farm: Farm;
  }
> = ({
  values,
  setFieldValue,
  //
  balances,
  beanstalk,
  weather,
  farm,
}) => {
  const chainId = useChainId();
  // TODO: constrain this when siloToken = Unripe
  const erc20TokenMap = useTokenMap<ERC20Token | NativeToken>([BEAN, ETH, WETH]);
  const [isTokenSelectVisible, showTokenSelect, hideTokenSelect] = useToggle();
  const getChainToken = useGetChainToken();
  const Bean = getChainToken(BEAN);
  const Weth = getChainToken<ERC20Token>(WETH);

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
      }
    },
    [farm, Weth]
  );

  const beans = values.tokens[0].token === Bean 
    ? values.tokens[0]?.amount || ZERO_BN
    : values.tokens[0]?.amountOut || ZERO_BN;

  const isSubmittable = beans?.gt(0);

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
          key={`tokens.0`}
          name={`tokens.0`}
          tokenOut={Bean}
          balance={balances[values.tokens[0].token.address] || undefined}
          state={values.tokens[0]}
          showTokenSelect={showTokenSelect}
          handleQuote={handleQuote}
        />
        {isSubmittable ? (
          <>
            <TxnSeparator mt={-1.5} />
            <TokenOutputField
              token={PODS}
              amount={beans.multipliedBy(weather.div(100).plus(1))}
            />
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
  const baseToken = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const balances = useFarmerBalances();
  const Bean = useChainConstant(BEAN);
  const Eth = useChainConstant(ETH);
  const { data: signer } = useSigner();
  const provider = useProvider();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const farm = useMemo(() => new Farm(provider), [provider]);
  const weather = useSelector<AppState, AppState['_beanstalk']['field']['weather']['yield']>((state) => state._beanstalk.field.weather.yield);

  // Form setup
  const initialValues : SowFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1, // 0.1%
    },
    tokens: [
      {
        token: baseToken as (ERC20Token | NativeToken),
        amount: null,
      },
    ],
  }), [baseToken]);

  // Handlers
  const onSubmit = useCallback(async (values: SowFormValues, formActions: FormikHelpers<SowFormValues>) => {
    try {
      const formData = values.tokens[0];
      const inputToken = formData.token;
      const amountBeans = inputToken === Bean ? formData.amount : formData.amountOut;
      if (values.tokens.length > 1) throw new Error('Only one token supported at this time');
      if (!amountBeans || amountBeans.eq(0)) throw new Error('No amount set');
      
      // TEMP: recast as BeanstalkReplanted 
      const data : string[] = [];
      const amountPods = amountBeans.times(weather.div(100).plus(1));
      let value = ZERO_BN;
      
      const txToast = new TransactionToast({
        loading: `Sowing ${displayFullBN(amountBeans, Bean.decimals)} Beans for ${displayFullBN(amountPods, PODS.decimals)} Pods`,
        success: 'Sow complete.',
      });
      
      // Sow directly from BEAN
      if (inputToken === Bean) {
        // Nothing to do
      } 
      
      // Swap to BEAN and Sow
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
          ethers.BigNumber.from(toStringBaseUnitBN(values.settings.slippage/100, 6)), // slippage
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
      )
 
      //
      return beanstalk.farm(data, { value: toStringBaseUnitBN(value, Eth.decimals) })
        .then((txn) => {
          txToast.confirming(txn);
          return txn.wait();
        })
        .then((receipt) => {
          txToast.success(receipt);
          formActions.resetForm();
        })
        .catch((err) => {
          console.error(
            txToast.error(err.error || err)
          );
        });

    } catch(e) {
      // txToast.error(err);
      formActions.setSubmitting(false);
    }
  }, [
    beanstalk,
    weather,
    Bean,
    Eth
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
            balances={balances}
            beanstalk={beanstalk}
            weather={weather}
            farm={farm}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
}


export default Sow;
