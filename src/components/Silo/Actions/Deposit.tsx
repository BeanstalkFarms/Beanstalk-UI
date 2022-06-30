import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip } from '@mui/material';
import { Token } from 'classes';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useProvider, useSigner } from 'wagmi';
import { BEAN, BEAN_CRV3_LP, CRV3, CRV3_UNDERLYING, DAI, ETH, ETH_DECIMALS, LUSD, SEEDS, STALK, USDC, USDT, WETH } from 'constants/tokens';
import useChainConstant, { getChainConstant } from 'hooks/useChainConstant';
import useTokenMap from 'hooks/useTokenMap';
import TokenSelectDialog, { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import TokenOutputField from 'components/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { FormState, FormTokenState } from 'components/Common/Form';
import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import TxnPreview from 'components/Common/Form/TxnPreview';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import Beanstalk from 'lib/Beanstalk';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import { BalanceState } from 'state/farmer/balances/reducer';
import { displayFullBN, toStringBaseUnitBN, toTokenUnitsBN } from 'util/Tokens';
import TransactionToast from 'components/Common/TxnToast';
import TxnSettings from 'components/Common/Form/TxnSettings';
import SettingInput from 'components/Common/Form/SettingInput';
import { BeanstalkReplanted } from 'constants/generated';
import { QuoteHandler } from 'hooks/useQuote';
import { ZERO_BN } from 'constants/index';
import { ERC20Token, NativeToken } from 'classes/Token';
import Pool from 'classes/Pool';
import SmartSubmitButton from 'components/Common/Form/SmartSubmitButton';
import { ethers } from 'ethers';
import Farm, { FarmFromMode, FarmToMode } from 'lib/Beanstalk/Farm';
import useGetChainToken from 'hooks/useGetChainToken';
import TxnSeparator from 'components/Common/Form/TxnSeparator';

// -----------------------------------------------------------------------

type DepositFormValues = FormState & {
  settings: {
    slippage: number;
  }
};

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
  const erc20TokenMap  = useTokenMap([BEAN, ETH, WETH, siloToken, CRV3, DAI, USDC, USDT]);
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

  // This handler does not run when _tokenIn = _tokenOut (direct deposit)
  const handleQuote = useCallback<QuoteHandler>(
    async (_tokenIn, _amountIn, _tokenOut) => {
      const Weth = getChainToken<ERC20Token>(WETH);
      const tokenIn  : ERC20Token = _tokenIn  instanceof NativeToken ? Weth : _tokenIn;
      const tokenOut : ERC20Token = _tokenOut instanceof NativeToken ? Weth : _tokenOut;
      const amountIn = ethers.BigNumber.from(toStringBaseUnitBN(_amountIn, tokenIn.decimals));
      let estimate;

      // Depositing BEAN
      if (tokenOut === getChainToken(BEAN)) {
        if (tokenIn === Weth) {
          estimate = await Farm.estimate(
            farm.buyBeans(), // this assumes we're coming from WETH
            [amountIn]
          );
        }
      } 
      
      // Depositing LP Tokens
      else {
        if (!pool) throw new Error(`Depositing to ${tokenOut.symbol} but no corresponding pool data found.`);
        
        // This is a Curve MetaPool...
        if (/* pool is Curve MetaPool */true) {
          // ...and we're depositing one of the underlying pool tokens.
          // Ex. for BEAN:3CRV this could be [BEAN, (DAI, USDC, USDT)].
          // pool.tokens      = [BEAN, CRV3]
          // pool.underlying  = [BEAN, DAI, USDC, USDT] 
          const tokenIndex = pool.tokens.indexOf(tokenIn);
          const underlyingTokenIndex = pool.underlying.indexOf(tokenIn);
          console.debug(`[Deposit] LP Deposit: pool=${pool.name}, tokenIndex=${tokenIndex}, underlyingTokenIndex=${underlyingTokenIndex}`)
          
          // This is X or CRV3
          if (tokenIndex > -1) {
            const indices = [0, 0];
            indices[tokenIndex] = 1; // becomes [0, 1] or [1, 0]
            console.debug(`[Deposit] LP Deposit: indices=`, indices);
            estimate = await Farm.estimate([
              farm.addLiquidity(
                pool.address,
                // FIXME: bean:lusd was a plain pool, bean:eth on curve would be a crypto pool
                // perhaps the Curve pool instance needs to track a registry
                farm.contracts.curve.registries.metaFactory.address,
                // FIXME: find a better way to define this above
                indices as [number, number],
                // Since this is the first piece of the chain (i.e. no swap before this)
                // switch from INTERNAL_TOLERANT mode to INTERNAL_EXTERNAL.
                FarmFromMode.INTERNAL_EXTERNAL,
              ),
            ], [amountIn]);
          } 

          // This is a CRV3-underlying stable (DAI/USDC/USDT etc)
          else if(underlyingTokenIndex > -1) {
            if (underlyingTokenIndex === 0) throw new Error('Malformatted pool.tokens / pool.underlying');
            const indices = [0, 0, 0];
            indices[underlyingTokenIndex - 1] = 1;
            console.debug(`[Deposit] LP Deposit: indices=`, indices);
            estimate = await Farm.estimate([
              // Deposit token into 3pool for 3CRV
              farm.addLiquidity(
                farm.contracts.curve.pools.pool3.address,
                farm.contracts.curve.registries.poolRegistry.address,
                indices as [number, number, number], // [DAI, USDC, USDT] use Tether from previous call
                // Since this is the first piece of the chain (i.e. no swap before this)
                // switch from INTERNAL_TOLERANT mode to INTERNAL_EXTERNAL.
                FarmFromMode.INTERNAL_EXTERNAL,
              ),
              farm.addLiquidity(
                pool.address,
                farm.contracts.curve.registries.metaFactory.address,
                // adding the 3CRV side of liquidity
                // FIXME: assuming that 3CRV is the second index (X:3CRV)
                // not sure if this is always the case
                [0, 1]
              ),
            ], [amountIn]);
          }

          // This is ETH or WETH
          else if (tokenIn === Weth) {
            estimate = await Farm.estimate([
              // FIXME: this assumes the best route from
              // WETH to [DAI, USDC, USDT] is via tricrypto2
              // swapping to USDT. we should use routing logic here to
              // find the best pool and output token.
              // --------------------------------------------------
              // WETH -> USDT
              farm.exchange(
                farm.contracts.curve.pools.tricrypto2.address,
                farm.contracts.curve.registries.cryptoFactory.address,
                Weth.address,
                getChainToken(USDT).address,
              ),
              // USDT -> deposit into pool3 for CRV3
              // FIXME: assumes USDT is the third index
              farm.addLiquidity(
                farm.contracts.curve.pools.pool3.address,
                farm.contracts.curve.registries.poolRegistry.address,
                [0, 0, 1], // [DAI, USDC, USDT]; use Tether from previous call
              ),
              // CRV3 -> deposit into right side of X:CRV3
              // FIXME: assumes CRV3 is the second index
              farm.addLiquidity(
                pool.address,
                farm.contracts.curve.registries.metaFactory.address,
                [0, 1],    // [BEAN, CRV3] use CRV3 from previous call
              ),
            ], [amountIn])
          }
        }
      }

      if (!estimate) {
        throw new Error(`Depositing ${tokenOut.symbol} to the Silo via ${tokenIn.symbol} is currently unsupported.`);
      }

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
              <TxnSeparator />
              <TokenOutputField
                token={siloToken}
                amount={bdv}
              />
              <Stack direction="row" gap={1} justifyContent="center">
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={STALK}
                    amount={stalk}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={SEEDS}
                    amount={seeds}
                  />
                </Box>
              </Stack>
              <Box>
                <Accordion defaultExpanded variant="outlined">
                  <StyledAccordionSummary title="Transaction Details" />
                  <AccordionDetails>
                    <TxnPreview
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
        amount: null,
      },
    ],
  }), [Eth]);

  // Handlers
  const onSubmit = useCallback(async (values: DepositFormValues, formActions: FormikHelpers<DepositFormValues>) => {
    if (!values.settings.slippage) throw new Error('No slippage value set.');

    console.debug(`Settings`, values.settings)

    // FIXME: getting BDV per amount here
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
          ]));
        }
        
        // `amountOut` of `siloToken` is received when swapping for 
        // `amount` of `inputToken`. this may include multiple swaps.
        // using "tolerant" mode allows for slippage during swaps.
        depositAmount = formData.amountOut;
        depositFrom   = FarmFromMode.INTERNAL_TOLERANT;

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
            <TxnSettings>
              <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
            </TxnSettings>
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
