import { Box, Button, InputAdornment, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import {
  FormState,
  FormTokenState,
  SettingInput,
  TokenQuoteProvider,
  TokenSelectDialog,
  TxnSettings
} from 'components/Common/Form';
import { SupportedChainId } from 'constants/index';
import { BEAN, ETH } from 'constants/tokens';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useChainId from 'hooks/useChain';
import useChainConstant from 'hooks/useChainConstant';
import useFarmerBalances from 'hooks/useFarmerBalances';
import { QuoteHandler } from 'hooks/useQuote';
import useTokenMap from 'hooks/useTokenMap';
import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { toStringBaseUnitBN, toTokenUnitsBN } from 'util/index';
import FieldWrapper from '../../Common/Form/FieldWrapper';
import SliderField from '../../Common/Form/SliderField';
import InputField from '../../Common/Form/InputField';
import { BeanstalkPalette } from '../../App/muiTheme';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import beanIcon from '../../../img/tokens/bean-logo-circled.svg';
import useCurve from '../../../hooks/useCurve';

export type BuyNowFormValues = FormState

const BuyNowForm : React.FC<
  FormikProps<BuyNowFormValues>
  & {
    token: ERC20Token | NativeToken;
  }
> = ({
  values,
  setFieldValue,
  //
  token: depositToken, // BEAN
}) => {
  const chainId = useChainId();
  const [showTokenSelect, setShowTokenSelect] = useState(false);

  const isMainnet = chainId === SupportedChainId.MAINNET;
  const curve = useCurve();
  const handleClose = useCallback(() => setShowTokenSelect(false), []);
  const handleOpen = useCallback(() => setShowTokenSelect(true), []);
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

  const handleQuote = useCallback<QuoteHandler>((tokenIn, amountIn, tokenOut): Promise<BigNumber> => {
    console.debug('[handleQuote] curve: ', curve);
    if (curve) {
      return curve.router.getBestRouteAndOutput(
        tokenIn.address,
        tokenOut.address,
        toStringBaseUnitBN(amountIn, tokenIn.decimals),
      ).then((result) => toTokenUnitsBN(result.output, tokenOut.decimals));
    }
    return Promise.reject();
  }, [curve]);

  const balances = useFarmerBalances();
  const erc20TokenMap = useTokenMap([BEAN, ETH, depositToken]);

  return (
    <Form noValidate>
      {/* Selected value: {values.option?.toString()} */}
      {/* <pre>{JSON.stringify({ ...values }, null, 2)}</pre> */}
      <Stack gap={1}>
        <TokenSelectDialog
          open={showTokenSelect}
          handleClose={handleClose}
          selected={values.tokens}
          handleSubmit={handleSelectTokens}
          balances={balances}
          tokenList={Object.values(erc20TokenMap)}
        />
        <FieldWrapper label="Number of Beans">
          <>
            {values.tokens.map((state, index) => (
              <TokenQuoteProvider
                key={`tokens.${index}`}
                name={`tokens.${index}`}
                tokenOut={depositToken}
                balance={balances[state.token.address] || undefined}
                state={state}
                showTokenSelect={handleOpen}
                disabled={isMainnet}
                disableTokenSelect={isMainnet}
                handleQuote={handleQuote}
              />
            ))}
          </>
        </FieldWrapper>
        <Button sx={{ p: 1 }} type="submit" disabled>
          Buy Pods
        </Button>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const BuyNow : React.FC<{}> = () => {
  const Eth = useChainConstant(ETH);

  const initialValues: BuyNowFormValues = useMemo(() => ({
    tokens: [
      {
        token: Eth,
        amount: null,
      },
    ],
  }), [Eth]);

  const onSubmit = useCallback((values: BuyNowFormValues, formActions: FormikHelpers<BuyNowFormValues>) => {
    Promise.resolve();
  }, []);

  return (
    <Formik<BuyNowFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<BuyNowFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <BuyNowForm
            token={BEAN[1]}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default BuyNow;
