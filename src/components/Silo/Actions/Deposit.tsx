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
          <Box>
            <pre>{JSON.stringify(values, null, 2)}</pre>
          </Box>
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
      if (values.tokens.length > 1) throw new Error('Only one token supported at this time');
      if (!values.tokens[0]?.amount || values.tokens[0].amount.eq(0)) throw new Error('No amount set');

      // TEMP: recast as BeanstalkReplanted 
      const b = ((beanstalk as unknown) as BeanstalkReplanted);
      const data : string[] = [];
      let value = ZERO_BN;
      let call;

      //
      if (siloToken === Bean) {
        // Bean -> Deposit
        if (values.tokens[0].token === Bean) {
          call = b.deposit(
            Bean.address,
            toStringBaseUnitBN(values.tokens[0].amount, Bean.decimals),
            FarmFromMode.EXTERNAL,
          );
          // data.push(...[
            // b.interface.encodeFunctionData('deposit', [
            //   Bean.address,
            //   '1000000', // toStringBaseUnitBN(values.tokens[0].amount, Bean.decimals),
            //   FarmFromMode.INTERNAL,
            // ]),
          // ]);
        }

        // ETH -> USDT -> Bean -> Deposit
        else if (values.tokens[0].token === Eth) {
          if (!values.tokens[0].steps || !values.tokens[0].amountOut) throw new Error(`No quote available for ${Eth.symbol}`);
          
          // value = value.plus(values.tokens[0].amount);
          // eslint-disable-next-line no-self-assign
          value = value;

          // TEST 1
          const encoded = Farm.encodeSlippage(
            values.tokens[0].steps,
            ethers.BigNumber.from(
              toStringBaseUnitBN(
                values.tokens[0].amount,
                Eth.decimals,
              )
            ),
            ethers.BigNumber.from(
              toStringBaseUnitBN(
                0.1/100,  
                6
              )
            ),
          );
          
          encoded.forEach((_data, index) => console.debug(`step ${index}:`, values.tokens[0]?.steps?.[index]?.decode(_data).map((elem) => elem.toString())))

          // TEST 2
          const usdtIn = ethers.BigNumber.from(toStringBaseUnitBN(10, USDT[1].decimals));
          const buyBeansStep = await farm.swapBeanCrv3Pool(usdtIn);
          console.debug(`buyBeansStep`, buyBeansStep);
          const pool      = farm.contracts.curve.beanCrv3.address;
          const tokenIn   = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT
          const tokenOut  = '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db'; // BEAN

          data.push(...[
            // buyBeansStep.encode(usdtIn, buyBeansStep.amountOut.mul(999).div(1000)),
            farm.contracts.beanstalk.interface.encodeFunctionData('exchangeUnderlying', [
              '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD', // bean3Crv pool
              '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
              '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db', // BEAN
              toStringBaseUnitBN(10, USDT[1].decimals),     // amountIn
              toStringBaseUnitBN(9, Bean.decimals),         // minAmountOut
              FarmFromMode.EXTERNAL,                        //
              FarmToMode.INTERNAL,                          //
            ]),
            // b.interface.encodeFunctionData('wrapEth', [
            //   toStringBaseUnitBN(value, Eth.decimals),
            //   FarmToMode.EXTERNAL
            // ]),
            // b.interface.encodeFunctionData('exchange', [
            //   '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46', // tricrypto2
            //   '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
            //   '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
            //   toStringBaseUnitBN('1', 18),                  // amountIn
            //   toStringBaseUnitBN('2800', 6),                // minAmountOut
            //   false,
            //   FarmFromMode.INTERNAL_TOLERANT,
            //   FarmToMode.EXTERNAL,
            // ]),
            // ...encoded,
            // b.interface.encodeFunctionData('deposit', [
            //   Bean.address,
            //   toStringBaseUnitBN(values.tokens[0].amountOut, Bean.decimals),
            //   FarmFromMode.INTERNAL_TOLERANT,
            // ]),
          ]);
        
          console.debug(`[Deposit] data: `, data);
          console.debug(`[Deposit] gas: `, await b.estimateGas.farm(data))
          call = b.farm(data);
        } else {
          call = Promise.reject(new Error(`No supported Deposit method for ${siloToken.name}`));
        }
      } else {
        call = Promise.reject(new Error(`No supported Deposit method for ${siloToken.name}`));
      }

      return call
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
    Bean,
    Eth,
    beanstalk,
    siloToken,
    farm,
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
