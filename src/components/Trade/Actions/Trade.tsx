import { Stack } from '@mui/material';
import { Form, Formik, FormikProps } from 'formik';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FormApprovingState, FormTokenState,
  SettingInput,
  SmartSubmitButton,
  TokenAdornment,
  TokenSelectDialog,
  TxnSeparator,
  TxnSettings
} from '~/components/Common/Form';
import { TokenSelectMode } from '~/components/Common/Form/TokenSelectDialog';
import TokenInputField from '~/components/Common/Form/TokenInputField';
import DestinationField from '~/components/Common/Form/DestinationField';
import Token, { ERC20Token, NativeToken } from '~/classes/Token';
import { Beanstalk } from '~/generated/index';
import { ZERO_BN } from '~/constants/index';
import { BEAN, DAI, ETH, USDC, USDT, WETH } from '~/constants/tokens';
import { useBeanstalkContract } from '~/hooks/useContract';
import useFarmerBalances from '~/hooks/useFarmerBalances';
import useTokenMap from '~/hooks/useTokenMap';
import { useSigner } from '~/hooks/ledger/useSigner';
import { FarmFromMode, FarmToMode } from '~/lib/Beanstalk/Farm';
import useGetChainToken from '~/hooks/useGetChainToken';

type TradeFormValues = {
  tokensIn:   FormTokenState[];
  modeIn:     FarmFromMode;
  tokensOut:  FormTokenState[];
  modeOut:    FarmToMode;
  approving?: FormApprovingState;
};

const TradeForm: React.FC<FormikProps<TradeFormValues> & {
  balances: ReturnType<typeof useFarmerBalances>;
  beanstalk: Beanstalk;
  tokenList: (ERC20Token | NativeToken)[]
}> = ({
  //
  values,
  setFieldValue,
  //
  balances,
  beanstalk,
  tokenList,
}) => {
  const [tokenSelect, setTokenSelect] =  useState<null | 'tokensIn' | 'tokensOut'>(null);

  /// Derived values
  // Inputs
  const stateIn   = values.tokensIn[0];
  const tokenIn   = stateIn.token;
  const balanceIn = balances[tokenIn.address];
  // Outputs
  const stateOut   = values.tokensOut[0];
  const tokenOut   = stateOut.token;
  const balanceOut = balances[tokenOut.address];

  ///
  const handleClose = useCallback(() => setTokenSelect(null), []);
  const handleShow  = useCallback((which: 'tokensIn' | 'tokensOut') => () => setTokenSelect(which), []);
  const handleSubmit = useCallback((_tokens: Set<Token>) => {
    if (tokenSelect !== null) {
      const copy = new Set(_tokens);
      const newValue = values[tokenSelect].filter((x) => {
        copy.delete(x.token);
        return _tokens.has(x.token);
      });
      setFieldValue(tokenSelect, [
        ...newValue,
        ...Array.from(copy).map((_token) => ({
          token: _token,
          amount: undefined
        })),
      ]);
    }
  }, [setFieldValue, tokenSelect, values]);

  const isValid = true;

  return (
    <Form autoComplete="off">
      <TokenSelectDialog
        title={(
          tokenSelect === 'tokensIn'
            ? 'Select Input Token'
            : 'Select Output Token'
        )}
        open={tokenSelect !== null}   // 'tokensIn' | 'tokensOut'
        handleClose={handleClose}     //
        handleSubmit={handleSubmit}   //
        selected={tokenSelect !== null ? values[tokenSelect] : []}
        balances={balances}
        tokenList={tokenList}
        mode={TokenSelectMode.SINGLE}
      />
      <Stack gap={1}>
        {/* Input */}
        <>
          <TokenInputField
            token={tokenIn}
            balance={balanceIn || ZERO_BN}
            name="tokensIn.0.amount"
            // MUI
            fullWidth
            InputProps={{
              endAdornment: (
                <TokenAdornment
                  token={tokenIn}
                  onClick={handleShow('tokensIn')}
                />
              )
            }}
          />
          <Stack gap={0.5}>
            <DestinationField
              name="modeIn"
              label="From"
            />
          </Stack>
        </>
        <TxnSeparator />
        {/* Output */}
        <>
          <TokenInputField
            token={tokenOut}
            balance={balanceOut || ZERO_BN}
            name="tokensOut.0.amount"
            // MUI
            fullWidth
            InputProps={{
              endAdornment: (
                <TokenAdornment
                  token={tokenOut}
                  onClick={handleShow('tokensOut')}
                />
              )
            }}
          />
          <DestinationField
            name="modeOut"
            label="to"
          />
        </>
        {/* <Box>
          <Accordion variant="outlined">
            <StyledAccordionSummary title="Transaction Details" />
            <AccordionDetails>
              <TxnPreview
                actions={[
                  {
                    type: ActionType.BASE,
                    message: 'Trade!'
                  },
                ]}
              />
            </AccordionDetails>
          </Accordion>
        </Box> */}
        <SmartSubmitButton
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={!isValid}
          contract={beanstalk}
          tokens={values.tokensOut.concat(values.tokensIn)}
          mode="auto"
        >
          Trade
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const SUPPORTED_TOKENS = [
  BEAN,
  ETH,
  WETH,
  DAI,
  USDC,
  USDT,
];

// const x = (farm: Farm) => ({
//   [BEAN[1].address]: {
//     [ETH[1].address]: [
//       // WETH -> USDT via tricrypto2 exchange
//       farm.exchange(
//         farm.contracts.curve.pools.tricrypto2.address,
//         farm.contracts.curve.registries.cryptoFactory.address,
//         getChainConstant(WETH, farm.provider.network.chainId).address,
//         getChainConstant(USDT, farm.provider.network.chainId).address,
//         _initialFromMode
//       ),
//       // USDT -> BEAN via bean3crv exchange_underlying
//       farm.exchangeUnderlying(
//         farm.contracts.curve.pools.beanCrv3.address,
//         getChainConstant(USDT, farm.provider.network.chainId).address,
//         getChainConstant(BEAN, farm.provider.network.chainId).address,
//       ),
//       ]
//   },
//   [ETH[1].address]: {
//     [BEAN[1].address]: [

//     ]
//   }
// });

/**
 * BEAN + ETH
 * ---------------
 * BEAN   -> ETH      exchange_underlying(BEAN, USDT) => exchange(USDT, WETH) => unwrapEth
 * BEAN   -> WETH     exchange_underlying(BEAN, USDT) => exchange(USDT, WETH)
 * ETH    -> BEAN     wrapEth => exchange(WETH, USDT) => exchange_underlying(USDT, BEAN)
 * WETH   -> BEAN     exchange(WETH, USDT) => exchange_underlying(USDT, BEAN)
 * 
 * BEAN + Stables
 * ---------------------
 * BEAN   -> DAI      exchange_underlying(BEAN, DAI, BEAN_METAPOOL)
 * BEAN   -> USDT     exchange_underlying(BEAN, USDT, BEAN_METAPOOL)
 * BEAN   -> USDC     exchange_underlying(BEAN, USDC, BEAN_METAPOOL)
 * BEAN   -> 3CRV     exchange(BEAN, 3CRV, BEAN_METAPOOL)
 * DAI    -> BEAN     exchange_underlying(DAI,  BEAN, BEAN_METAPOOL)
 * USDT   -> BEAN     exchange_underlying(BEAN, USDT, BEAN_METAPOOL)
 * USDC   -> BEAN     exchange_underlying(BEAN, USDC, BEAN_METAPOOL)
 * 3CRV   -> BEAN     exchange(3CRV, BEAN, BEAN_METAPOOL)
 * 
 * Internal <-> External
 * ---------------------
 * TOK-i  -> TOK-e    transferToken(TOK, self, amount, INTERNAL, EXTERNAL)
 * TOK-e  -> TOK-i    transferToken(TOK, self, amount, EXTERNAL, INTERNAL)
 * 
 * Stables
 * ---------------------
 * USDC   -> USDT     exchange(USDC, USDT, 3POOL)
 * ...etc
 */

const Trade: React.FC<{}> = () => {
  ///
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);

  ///
  const getChainToken = useGetChainToken();
  const Eth           = getChainToken(ETH);
  const Bean          = getChainToken(BEAN);
  const tokenMap      = useTokenMap<ERC20Token | NativeToken>(SUPPORTED_TOKENS);
  const tokenList     = useMemo(() => Object.values(tokenMap), [tokenMap]);
  
  ///
  const farmerBalances = useFarmerBalances();

  // Form setup
  const initialValues: TradeFormValues = useMemo(() => ({
    tokensIn: [
      {
        token: Eth,
        amount: undefined,
      }
    ],
    modeIn: FarmFromMode.EXTERNAL,
    tokensOut: [
      {
        token: Bean,
        amount: undefined,
      }
    ],
    modeOut: FarmToMode.EXTERNAL,
  }), [Bean, Eth]);

  const onSubmit = useCallback(async () => {
      console.log('SUBMIT');
    },
    []
  );

  return (
    <Formik<TradeFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<TradeFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <TradeForm
            balances={farmerBalances}
            beanstalk={beanstalk}
            tokenList={tokenList}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Trade;
