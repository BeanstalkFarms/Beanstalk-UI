import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip } from '@mui/material';
import { Token } from 'classes';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useSigner } from 'wagmi';
import { BEAN, BEAN_CRV3_LP, ETH, LUSD, SEEDS, STALK, USDC, WETH } from 'constants/tokens';
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
import { BeanstalkReplanted } from 'constants/generated';
import useCurve from 'hooks/useCurve';
import { QuoteHandler } from 'hooks/useQuote';
import { ZERO_BN } from 'constants/index';
import { NativeToken } from 'classes/Token';
import { BEAN_CRV3_CURVE_POOL_MAINNET } from 'constants/pools';

// -----------------------------------------------------------------------

type DepositFormValues = {
  tokens: FormTokenState[];
}

// -----------------------------------------------------------------------

const DepositForm : React.FC<
  FormikProps<DepositFormValues> & {
    token: Token;
    balances: BalanceState;
  }
> = ({
  // Custom
  token: depositToken,
  balances,
  // Formik
  values,
  isSubmitting,
  setFieldValue,
}) => {
  const chainId = useChainId();
  const erc20TokenMap = useTokenMap([BEAN, ETH, depositToken]);
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  const curve = useCurve();

  const { bdv, stalk, seeds, actions } = Beanstalk.Silo.Deposit.deposit(
    depositToken,
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
  const handleQuote = useCallback<QuoteHandler>(async (_tokenIn, _amountIn, _tokenOut) : Promise<BigNumber> => {
    // console.debug('[handleQuote] curve: ', curve);
    if (curve) {
      // const tokenIn  = (_tokenIn  instanceof NativeToken) ? WETH[1] : _tokenIn;
      // const tokenOut = (_tokenOut instanceof NativeToken) ? WETH[1] : _tokenOut;
      const tokenIn  = BEAN[1];
      const tokenOut = BEAN_CRV3_LP[1];
      // const amountIn = toStringBaseUnitBN(_amountIn, tokenIn.decimals)
      console.debug(`[Deposit]: routing ${_amountIn.toFixed()} ${tokenIn.symbol} => ${tokenOut.symbol}`)
      
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
    }
    return Promise.resolve(ZERO_BN);
  }, [curve]);

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
                // tokenOut={depositToken}
                tokenOut={BEAN_CRV3_LP[1]}
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
                token={depositToken}
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
          <Button disabled={!isReady || isSubmitting} type="submit" size="large" fullWidth>
            Deposit
          </Button>
        </Stack>
      </Form>
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

enum TransferMode {
  EXTERNAL = '0',
  INTERNAL = '1',
  INTERNAL_EXTERNAL = '2',
  INTERNAL_TOLERANT = '3',
}

// TODO:
// - implement usePreferredToken here
const Deposit : React.FC<{ token: Token; }> = ({ token }) => {
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
        token: Eth,
        amount: null,
      },
    ],
  }), [Eth]);
  const onSubmit = useCallback(async (values: DepositFormValues, formActions: FormikHelpers<DepositFormValues>) => {
    const { amount } = Beanstalk.Silo.Deposit.deposit(
      token,
      values.tokens,
      (_amount: BigNumber) => _amount,
    );
    const txToast = new TransactionToast({
      loading: `Depositing ${displayFullBN(amount.abs(), token.displayDecimals, token.displayDecimals)} ${token.name} to the Silo`,
      success: 'Deposit successful.',
    });
    
    try {
      if (values.tokens.length > 1) throw new Error('Only one token supported at this time');
      // if (values.tokens[0].token !== token) throw new Error('Must deposit token directly at this time');

      // TEMP: recast as BeanstalkReplanted 
      const b = ((beanstalk as unknown) as BeanstalkReplanted);

      let call;
      if (token === Bean) {
        const data = [
          b.interface.encodeFunctionData('wrapEth', [
            toStringBaseUnitBN('1', Eth.decimals),
            TransferMode.INTERNAL
          ]),
          // b.interface.encodeFunctionData("exchange", [
          //   "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46",
          //   "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          //   "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          //   '1',
          //   // toStringBaseUnitBN(1, )
          // ]),
        ];
        console.log(await b.callStatic.farm(data, { value: toStringBaseUnitBN('1', Eth.decimals) }));
        call = b.farm(data, { value: toStringBaseUnitBN('1', Eth.decimals) });
        // call = beanstalk.depositBeans(
        //   toStringBaseUnitBN(amount, token.decimals)
        // );
      } else {
        call = Promise.reject(new Error(`No supported Deposit method for ${token.name}`));
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
                amount: toStringBaseUnitBN(amount, token.decimals)
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
    token,
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
            token={token}
            balances={balances}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Deposit;
