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

      const farm = new Farm(provider);

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

      return toTokenUnitsBN(
        estimate.amountOut.toString(),
        tokenOut.decimals,
      );
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
