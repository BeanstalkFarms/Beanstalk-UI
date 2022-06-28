import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip } from '@mui/material';
import { Token } from 'classes';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useProvider, useSigner } from 'wagmi';
import { BEAN, BEAN_CRV3_LP, ETH, ETH_DECIMALS, LUSD, SEEDS, STALK, USDC, USDT, WETH } from 'constants/tokens';
import useChainConstant from 'hooks/useChainConstant';
import useTokenMap from 'hooks/useTokenMap';
import TokenSelectDialog, { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import TokenOutputField from 'components/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { FormTokenState } from 'components/Common/Form';
import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import TransactionPreview from 'components/Common/Form/TransactionPreview';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import Beanstalk from 'lib/Beanstalk';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import { BalanceState } from 'state/farmer/balances/reducer';
import { displayFullBN, toStringBaseUnitBN, toTokenUnitsBN } from 'util/Tokens';
import TransactionToast from 'components/Common/TxnToast';
import TransactionSettings from 'components/Common/Form/TransactionSettings';
import SettingInput from 'components/Common/Form/SettingInput';
import { BeanstalkReplanted, Curve3Pool__factory, CurveFactory__factory, CurveMetaPool__factory, CurvePlainPool__factory, CurveTriCrypto2Pool__factory } from 'constants/generated';
import useCurve from 'hooks/useCurve';
import { QuoteHandler } from 'hooks/useQuote';
import { POOL3_ADDRESSES, ZERO_BN } from 'constants/index';
import { NativeToken } from 'classes/Token';
import { BEAN_CRV3_CURVE_POOL_MAINNET } from 'constants/pools';
import { CurveMetaPool } from 'classes/Pool';
import SmartSubmitButton from 'components/Common/Form/SmartSubmitButton';
import { BigNumberish, ethers } from 'ethers';
import Farm from 'lib/Beanstalk/Farm';

// -----------------------------------------------------------------------

type DepositFormValues = {
  tokens: FormTokenState[];
}

// -----------------------------------------------------------------------

const DepositForm : React.FC<
  FormikProps<DepositFormValues> & {
    siloToken: Token;
    balances: BalanceState;
    contract: ethers.Contract;
    farm: Farm;
  }
> = ({
  // Custom
  siloToken,
  balances,
  contract,
  farm,
  // Formik
  values,
  isSubmitting,
  setFieldValue,
}) => {
  const chainId = useChainId();
  const erc20TokenMap = useTokenMap([BEAN, ETH, WETH, USDT, USDC, siloToken]);
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  // const curve = useCurve();

  const { bdv, stalk, seeds, actions } = Beanstalk.Silo.Deposit.deposit(
    siloToken,
    values.tokens,
    (amount: BigNumber) => amount,
  );

  const isMainnet = chainId === SupportedChainId.MAINNET;
  const isReady   = bdv.gt(0);
  const handleClose = useCallback(() => setShowTokenSelect(false), []);
  const handleOpen  = useCallback(() => setShowTokenSelect(true),  []);
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
      ...Array.from(copy).map((_token) => ({ token: _token, amount: undefined })),
    ]);
  }, [values.tokens, setFieldValue]);
  const handleQuote = useCallback<QuoteHandler>(
    async (_tokenIn, _amountIn, _tokenOut) => {
      if (_tokenIn.symbol !== 'ETH') return Promise.resolve(ZERO_BN);

      const tokenIn  = _tokenIn  instanceof NativeToken ? WETH[1] : _tokenIn;
      const tokenOut = _tokenOut instanceof NativeToken ? WETH[1] : _tokenOut;

      //
      let estimate;
      if (tokenOut === BEAN_CRV3_LP[1]) {
        estimate = await Farm.estimate(
          farm.buyAndDepositBeanCrv3LP(),
          [ethers.BigNumber.from(toStringBaseUnitBN(_amountIn, tokenIn.decimals))]
        );
      } else {
        estimate = await Farm.estimate(
          farm.buyBeans(),
          [ethers.BigNumber.from(toStringBaseUnitBN(_amountIn, tokenIn.decimals))]
        );
      }

      console.debug('[chain] estimate = ', estimate);

      return {
        amountOut: toTokenUnitsBN(
          estimate.amountOut.toString(),
          tokenOut.decimals,
        ),
        steps: estimate.steps,
      }
    },
    [farm]
  );

  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate>
        <Stack gap={1}>
          <TokenSelectDialog
            open={showTokenSelect}
            handleClose={handleClose}
            selected={values.tokens}
            handleSubmit={handleSelectTokens}
            balances={balances}
            tokenList={Object.values(erc20TokenMap)}
            mode={TokenSelectMode.SINGLE}
          />
          <Stack gap={1.5}>
            {values.tokens.map((state, index) => (
              <TokenQuoteProvider
                key={`tokens.${index}`}
                name={`tokens.${index}`}
                tokenOut={siloToken}
                // tokenOut={BEAN_CRV3_LP[1]}
                balance={balances[state.token.address] || undefined}
                state={state}
                showTokenSelect={handleOpen}
                disabled={isMainnet}
                disableTokenSelect={isMainnet}
                handleQuote={handleQuote}
              />
            ))}
          </Stack>
          {isReady ? (
            <Stack direction="column" gap={1}>
              <TokenOutputField
                token={siloToken}
                value={bdv}
              />
              <Stack direction="row" gap={1} justifyContent="center">
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={STALK}
                    value={stalk}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={SEEDS}
                    value={seeds}
                  />
                </Box>
              </Stack>
              <Box>
                <Accordion defaultExpanded variant="outlined">
                  <StyledAccordionSummary title="Transaction Details" />
                  <AccordionDetails>
                    <TransactionPreview
                      actions={actions}
                    />
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Stack>
          ) : null}
          <SmartSubmitButton
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            contract={contract}
            tokens={values.tokens}
            mode="auto"
          >
            Deposit
          </SmartSubmitButton>
          {/* <Box>
            <pre>{JSON.stringify(values, null, 2)}</pre>
          </Box> */}
        </Stack>
      </Form>
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

enum FarmFromMode {
  EXTERNAL = '0',
  INTERNAL = '1',
  INTERNAL_EXTERNAL = '2',
  INTERNAL_TOLERANT = '3',
}
enum FarmToMode {
  EXTERNAL = '0',
  INTERNAL = '1',
}

// TODO:
// - implement usePreferredToken here
const Deposit : React.FC<{ siloToken: Token; }> = ({ siloToken }) => {
  const Bean = useChainConstant(BEAN);
  const Eth = useChainConstant(ETH);
  const balances = useFarmerBalances();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);
  const provider = useProvider();
  const farm = useMemo(() => new Farm(provider), [provider]);

  const initialValues : DepositFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1,
    },
    tokens: [
      {
        token: Bean,
        amount: null,
      },
    ],
  }), [Bean]);
  const onSubmit = useCallback(async (values: DepositFormValues, formActions: FormikHelpers<DepositFormValues>) => {
    const { amount } = Beanstalk.Silo.Deposit.deposit(
      siloToken,
      values.tokens,
      (_amount: BigNumber) => _amount,
    );

    const txToast = new TransactionToast({
      loading: `Depositing ${displayFullBN(amount.abs(), siloToken.displayDecimals, siloToken.displayDecimals)} ${siloToken.name} to the Silo`,
      success: 'Deposit successful.',
    });
    
    try {
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
      if (inputToken === siloToken) {
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
            FarmToMode.INTERNAL,
          ]))
        }
        
        // `amountOut` of `siloToken` is received when swapping for 
        // `amount` of `inputToken`. this may include multiple swaps.
        // using "tolerant" mode allows for slippage during swaps.
        depositAmount = formData.amountOut;
        depositFrom   = FarmFromMode.INTERNAL_TOLERANT;

        // Encode steps to get from token i to siloToken
        const encoded = Farm.encodeStepsWithSlippage(
          formData.steps,
          ethers.BigNumber.from(toStringBaseUnitBN(0.1/100, 6)), // slippage
        );
        data.push(...encoded);
      } 

      // Deposit step
      data.push(
        b.interface.encodeFunctionData('deposit', [
          siloToken.address,
          toStringBaseUnitBN(depositAmount, siloToken.decimals),  // expected amountOut from all steps
          depositFrom,
        ])
      )

      // CALL: FARM
      console.debug(`[Deposit] data: `, data);
      console.debug(`[Deposit] gas: `, await b.estimateGas.farm(data, { value: toStringBaseUnitBN(value, Eth.decimals) }))
     
      return b.farm(data, { value: toStringBaseUnitBN(value, Eth.decimals) })
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
            txToast.error(err.error || err),
            {
              calldata: {
                amount: toStringBaseUnitBN(amount, siloToken.decimals)
              }
            }
          );
        });
      } catch (err) {
        txToast.error(err);
        formActions.setSubmitting(false);
        // formActions.setErrors(null);
        // formActions.resetForm();
      }
  }, [
    Eth,
    beanstalk,
    siloToken,
  ]);

  //
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <>
          {/* Padding below matches tabs and input position. See Figma. */}
          <Box sx={{ position: 'absolute', top: 0, right: 0, pr: 1.3, pt: 1.7 }}>
            <TransactionSettings>
              <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
            </TransactionSettings>
          </Box>
          <DepositForm
            siloToken={siloToken}
            balances={balances}
            contract={beanstalk}
            farm={farm}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Deposit;
