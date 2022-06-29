import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip } from '@mui/material';
import { Token } from 'classes';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useProvider, useSigner } from 'wagmi';
import { BEAN, BEAN_CRV3_LP, DAI, ETH, ETH_DECIMALS, LUSD, SEEDS, STALK, USDC, USDT, WETH } from 'constants/tokens';
import useChainConstant, { getChainConstant } from 'hooks/useChainConstant';
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
import { BeanstalkReplanted } from 'constants/generated';
import useCurve from 'hooks/useCurve';
import { QuoteHandler } from 'hooks/useQuote';
import { POOL3_ADDRESSES, ZERO_BN } from 'constants/index';
import { ERC20Token, NativeToken } from 'classes/Token';
import { BEAN_CRV3_CURVE_POOL_MAINNET } from 'constants/pools';
import Pool, { CurveMetaPool } from 'classes/Pool';
import SmartSubmitButton from 'components/Common/Form/SmartSubmitButton';
import { BigNumberish, ethers } from 'ethers';
import Farm, { FarmFromMode, FarmToMode } from 'lib/Beanstalk/Farm';
import useGetChainToken from 'hooks/useGetChainToken';

// -----------------------------------------------------------------------

type DepositFormValues = {
  tokens: FormTokenState[];
}

// -----------------------------------------------------------------------

const DepositForm : React.FC<
  FormikProps<DepositFormValues> & {
    pool: Pool;
    siloToken: ERC20Token | NativeToken;
    balances: BalanceState;
    contract: ethers.Contract;
    farm: Farm;
  }
> = ({
  // Custom
  pool,
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
  // TODO: constrain this when siloToken = Unripe
  const erc20TokenMap  = useTokenMap([BEAN, ETH, WETH, siloToken, DAI, USDC, USDT]);
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  const getChainToken = useGetChainToken();

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

  // This handler does not run when _tokenIn = _tokenOut
  const handleQuote = useCallback<QuoteHandler>(
    async (_tokenIn, _amountIn, _tokenOut) => {
      const tokenIn  : ERC20Token = _tokenIn  instanceof NativeToken ? getChainToken<ERC20Token>(WETH) : _tokenIn;
      const tokenOut : ERC20Token = _tokenOut instanceof NativeToken ? getChainToken<ERC20Token>(WETH) : _tokenOut;
      const amountIn = ethers.BigNumber.from(toStringBaseUnitBN(_amountIn, tokenIn.decimals));
      let estimate;

      // Depositing BEAN
      if (tokenOut === getChainToken(BEAN)) {
        estimate = await Farm.estimate(
          farm.buyBeans(), // this assumes we're coming from WETH
          [amountIn]
        );
      } 
      
      // Depositing LP Tokens
      else {
        if (!pool) throw new Error(`Depositing to ${tokenOut.symbol} but no corresponding pool data found.`);
        
        // This is a Curve pool...
        if (/* pool is Curve */true) {
          // ...and we're depositing one of the underlying pool tokens.
          // Ex. for BEAN:3CRV this could be [BEAN, (DAI, USDC, USDT)].
          const underlyingIndex = pool.underlying.indexOf(tokenIn);
          if (underlyingIndex > -1) {
            console.debug(`[Deposit] underlyingIndex = ${underlyingIndex}`);
            estimate = await Farm.estimate([
              farm.addLiquidity(
                farm.contracts.curve.pools.pool3.address,
                farm.contracts.curve.registries.poolRegistry.address,
                [0, 0, 1], // [DAI, USDC, USDT] use Tether from previous call
              ),
              farm.addLiquidity(
                farm.contracts.curve.pools.beanCrv3.address,
                farm.contracts.curve.registries.metaFactory.address,
                [0, 1]
              ),
            ], [amountIn]);
          } else {
            throw new Error('Unknown MODE');
          }
        }
      }

      // Swap `tokenIn` to a 3CRV stable and addLiquidity to the BEAN:3CRV Pool.
      // how many BEAN:3CRV LP tokens do we get for the `addLiquidity`?
      // else if (tokenOut === getChainToken(BEAN_CRV3_LP)) {
      //   estimate = await Farm.estimate(
      //     farm.buyAndAddBEANCRV3Liquidity(), // this assumes we're coming from WETH
      //     [amountIn]
      //   );
      // }
      
      // Unknown
      // else {
      //   // return Promise.resolve(ZERO_BN)
      //   throw new Error(`Unsupported tokenOut: ${tokenOut.symbol}`)
      // }

      console.debug('[chain] estimate = ', estimate);

      return {
        amountOut: toTokenUnitsBN(estimate.amountOut.toString(), tokenOut.decimals),
        steps: estimate.steps,
      }
    },
    [farm, pool, getChainToken]
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
        </Stack>
      </Form>
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

// TODO:
// - implement usePreferredToken here
const Deposit : React.FC<{
  pool: Pool;
  siloToken: ERC20Token | NativeToken;
}> = ({
  pool,
  siloToken
}) => {
  const Eth = useChainConstant(ETH);
  const balances = useFarmerBalances();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const beanstalk = useBeanstalkContract(signer);
  const farm = useMemo(() => new Farm(provider), [provider]);

  // Form setup
  const initialValues : DepositFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1,
    },
    tokens: [
      {
        token: Eth,
        amount: new BigNumber(0.01),
      },
    ],
  }), [Eth]);

  // Handlers
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
        encoded.forEach((_data, index) => 
          console.debug(`[Deposit] step ${index}:`, formData.steps?.[index]?.decode(_data).map((elem) => (elem instanceof ethers.BigNumber ? elem.toString() : elem)))
        );
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
            pool={pool}
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
