import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip } from '@mui/material';
import { Token } from 'classes';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useProvider, useSigner } from 'wagmi';
import { BEAN, BEAN_CRV3_LP, ETH, ETH_DECIMALS, LUSD, SEEDS, STALK, USDC, WETH } from 'constants/tokens';
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
import { Action, QuoteHandler, Step } from 'hooks/useQuote';
import { POOL3_ADDRESSES, ZERO_BN } from 'constants/index';
import { NativeToken } from 'classes/Token';
import { BEAN_CRV3_CURVE_POOL_MAINNET } from 'constants/pools';
import { CurveMetaPool } from 'classes/Pool';
import SmartSubmitButton from 'components/Common/Form/SmartSubmitButton';
import { BigNumberish, ethers } from 'ethers';

// -----------------------------------------------------------------------

type DepositFormValues = {
  tokens: FormTokenState[];
}

const TRICRYPTO2 = '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46';
const CURVE_FACTORY = '0xB9fC157394Af804a3578134A6585C0dc9cc990d4';

// -----------------------------------------------------------------------

const DepositForm : React.FC<
  FormikProps<DepositFormValues> & {
    siloToken: Token;
    balances: BalanceState;
    contract: ethers.Contract;
  }
> = ({
  // Custom
  siloToken,
  balances,
  contract,
  // Formik
  values,
  isSubmitting,
  setFieldValue,
}) => {
  const chainId = useChainId();
  const erc20TokenMap = useTokenMap([BEAN, ETH, siloToken]);
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  // const curve = useCurve();
  const provider = useProvider();

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
    async (_tokenIn, _amountIn, _tokenOut) : Promise<BigNumber> => {
      if (_tokenIn.symbol !== 'ETH') return Promise.resolve(ZERO_BN);

      const tokenIn  = _tokenIn  instanceof NativeToken ? WETH[1] : _tokenIn;
      const tokenOut = _tokenOut instanceof NativeToken ? WETH[1] : _tokenOut;
      
      // Get amount received for swapping _amountIn WETH -> USDT
      const beanCrv3Pool    = BEAN_CRV3_CURVE_POOL_MAINNET.getContract();                 // BEAN:3CRV metapool
      const tricryptoPoolV2 = CurveTriCrypto2Pool__factory.connect(TRICRYPTO2, provider); // tricrypto2
      const pool3           = Curve3Pool__factory.connect(POOL3_ADDRESSES[1], provider);  // 3pool
      const curveFactory    = CurveFactory__factory.connect(CURVE_FACTORY, provider);     // registry
      const beanstalk       = ((contract as unknown) as BeanstalkReplanted);

      // 1. Get amount of USDT resulting from BEAN
      // The get_coin_indices call isn't working because curveFactory doesn't
      // seem to be tracking tricrypto2
      // const tricryptoCoins = [
      //   2, // i = from = WETH
      //   0  // j = to   = USDT
      // ];
      // const tricryptoCoins = await curveFactory.callStatic.get_coin_indices(
      //   TRICRYPTO2,
      //   WETH[1].address, // WETH
      //   '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      //   { gasLimit: 10000000 },
      // );

      type ChainableFunction = (amountIn: ethers.BigNumber) => Promise<[
        amountOut: ethers.BigNumber,
        encode: (amountIn: ethers.BigNumber, minAmountOut: ethers.BigNumber) => string,
        data?: any
      ]>;

      async function chain(
        fns: ChainableFunction[],
        initialArgs: [amountIn: ethers.BigNumber]
      ) : Promise<ethers.BigNumber> {
        let args = initialArgs;
        for (let i = 0; i < fns.length; i += 1) {
          console.debug(`[chain] calling ${i}`);
          const call = await fns[i](...args);
          console.debug(`[chain] called ${i} = `, call);
          args = [call[0]];
        }
        return args[0];
      }

      function buyBeansAction() {
        const estimate = async (
          initAmountIn: ethers.BigNumber
        ) => {
          // console.debug(`SWAP QUOTE: amountOutUSDT = `, amountOutUSDT.toString())
          return chain([
            async (amountInStep: ethers.BigNumber) => {
              const amountOut = await tricryptoPoolV2.get_dy(
                2, // i = WETH = tricryptoPoolV2.coins[2]
                0, // j = USDT = tricryptoPoolV2.coins[0]
                amountInStep,
                { gasLimit: 10000000 }
              );
              return [
                amountOut,
                (amountIn, minAmountOut) => beanstalk.interface.encodeFunctionData('exchange', [
                  tricryptoPoolV2.address,
                  WETH[1].address,                                            // WETH
                  '0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase(), // USDT
                  amountIn,
                  minAmountOut,
                  false,
                  FarmFromMode.INTERNAL_TOLERANT,
                  FarmToMode.INTERNAL,
                ]),
                {
                  amountIn: amountInStep,
                  tokenIn
                }
              ];
            },
            async (amountInStep: ethers.BigNumber) => {
              const amountOut = await beanCrv3Pool.callStatic['get_dy_underlying(int128,int128,uint256)'](
                3,  // i = USDT = coins[3] ([BEAN, CRV3] => [BEAN, DAI, USDC, USDT])
                0,  // j = BEAN = coins[0]
                amountInStep,
                { gasLimit: 10000000 }
              );
              return [
                amountOut,
                (amountIn, minAmountOut) => beanstalk.interface.encodeFunctionData('exchangeUnderlying', [
                  BEAN_CRV3_CURVE_POOL_MAINNET.address,
                  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
                  BEAN[1].address, // BEAN
                  amountIn,
                  minAmountOut,
                  FarmFromMode.INTERNAL_TOLERANT,
                  FarmToMode.INTERNAL,
                ]),
                {}
              ];
            }
          ], [
            initAmountIn
          ]);
        };
        return {
          estimate,
          farm: () => {}
        };
      }

      function buyCrv3Action() {
        
      }

      return toTokenUnitsBN(
        (await buyBeansAction().estimate(
          ethers.BigNumber.from(
            toStringBaseUnitBN(_amountIn, tokenIn.decimals)
          )
        )).toString(),
        tokenOut.decimals,
      );

      // // ETH -> USDT -> BEAN -> deposit
      // if (_tokenOut.symbol === 'BEAN') {
      //   return toTokenUnitsBN(amountOutBeans.toString(), BEAN[1].decimals);
      // } 

      // // ETH -> USDT -> CRV3 -> addLiquidity
      // const amountOutCRV3 = await pool3.callStatic.calc_token_amount(
      //   [0, 0, amountOutUSDT],
      //   true, // _is_deposit
      // );
      // const amountOutBEANCRV3 = await beanCrv3Pool.callStatic['calc_token_amount(uint256[2],bool)'](
      //   [0, amountOutCRV3],
      //   true // _is_deposit
      // );

      // console.debug(`SWAP QUOTE: `, {
      //   coins: tricryptoCoins,
      //   out: {
      //     usdt: amountOutUSDT.toString(),
      //     crv3: amountOutCRV3.toString(),
      //     beancrv3: amountOutBEANCRV3.toString(),
      //   }
      // })

      // return toTokenUnitsBN(amountOutBEANCRV3.toString(), BEAN_CRV3_LP[1].decimals);

      // if (curve) {
        // const tokenIn  = (_tokenIn  instanceof NativeToken) ? WETH[1] : _tokenIn;
        // const tokenOut = (_tokenOut instanceof NativeToken) ? WETH[1] : _tokenOut;
        // const tokenIn  = BEAN[1];
        // const tokenOut = BEAN_CRV3_LP[1];
        // const amountIn = toStringBaseUnitBN(_amountIn, tokenIn.decimals)
        // console.debug(`[Deposit]: routing ${_amountIn.toFixed()} ${tokenIn.symbol} => ${tokenOut.symbol}`)
        
        // return curve.getPool(BEAN_CRV3_CURVE_POOL_MAINNET.address);
      
        // return curve.router.getBestRouteAndOutput(
        //   tokenIn.address,
        //   tokenOut.address,
        //   // '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
        //   // '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490', // CRV3
        //   _amountIn.toFixed(),
        //   // tokenIn.address.toLowerCase(),
        //   // tokenOut.address.toLowerCase(),
        //   // amountIn
        // ).then((result) => {
        //   console.debug(`[Deposit] received quote`, result);
        //   return new BigNumber(result.output)
        //   // return toTokenUnitsBN(result.output, tokenOut.decimals);
        //   // return new BigNumber(result.output);
        // });
      // }
      // return Promise.resolve(ZERO_BN);
    },
    [provider]
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
      // if (values.tokens[0].token !== token) throw new Error('Must deposit token directly at this time');

      // TEMP: recast as BeanstalkReplanted 
      const b = ((beanstalk as unknown) as BeanstalkReplanted);

      let call;
      if (siloToken === Bean) {
        const data : string[] = [];

        // Bean -> Deposit
        if (values.tokens[0].token === Bean) {
          data.push(...[
            b.interface.encodeFunctionData('deposit', [
              Bean.address,
              toStringBaseUnitBN(values.tokens[0].amount, Bean.decimals),
              FarmFromMode.EXTERNAL,
            ]),
          ]);
        }
        
        // ETH -> USDT -> Bean -> Deposit
        else if (values.tokens[0].token === Eth) {
          data.push(...[
            b.interface.encodeFunctionData('wrapEth', [
              toStringBaseUnitBN(
                values.tokens[0].amount,
                Eth.decimals
              ),
              FarmFromMode.INTERNAL
            ]),
            // b.interface.encodeFunctionData('exchange', [
            //   '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46'.toLowerCase(), // tricrypto2
            //   WETH[1].address,                                            // WETH
            //   '0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase(), // USDT
            // ]),
            // b.interface.encodeFunctionData("exchange", [
            //   "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46",
            //   "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            //   "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            //   '1',
            //   // toStringBaseUnitBN(1, )
            // ]),
          ]);
        }
        
        console.debug(`[Deposit] callStatic`, data);
        // console.debug(`[Deposit]`, await b.callStatic.deposit(Bean.address, toStringBaseUnitBN(values.tokens[0].amount, Bean.decimals), FarmFromMode.EXTERNAL))
        // console.debug(`[Deposit] callStatic`, await b.callStatic.farm(data));
        // call = b.deposit(
        //   '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db'.toLowerCase(),
        //   '1000000',
        //   '0'
        // );
        // toStringBaseUnitBN(values.tokens[0].amount, Bean.decimals),
        call = b.farm(data);
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
        // formActions.setErrors(null);
        formActions.setSubmitting(false);
        formActions.resetForm();
      }
  }, [
    Bean,
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
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Deposit;
