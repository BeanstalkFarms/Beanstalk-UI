import { Box, Button, InputAdornment, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import {
  FormTokenState,
  SettingInput, TokenAdornment, TokenInputField,
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
import { displayFullBN, toStringBaseUnitBN, toTokenUnitsBN } from 'util/index';
import FieldWrapper from '../../Common/Form/FieldWrapper';
import SliderField from '../../Common/Form/SliderField';
import { BeanstalkPalette } from '../../App/muiTheme';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import useCurve from '../../../hooks/useCurve';

export type BuyOrderFormValues = {
  placeInLine: BigNumber | null;
  pricePerPod: BigNumber | null;
  tokens: FormTokenState[];
}

const BuyOrderForm : React.FC<
  FormikProps<BuyOrderFormValues>
  & {
    podLine: BigNumber;
    token: ERC20Token | NativeToken;
  }
> = ({
  values,
  podLine,
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
      <Stack gap={1}>
        <TokenSelectDialog
          open={showTokenSelect}
          handleClose={handleClose}
          selected={values.tokens}
          handleSubmit={handleSelectTokens}
          balances={balances}
          tokenList={Object.values(erc20TokenMap)}
        />
        {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
        <FieldWrapper label="Place in Line">
          <Box px={2}>
            <SliderField
              min={0}
              fields={['placeInLine']}
              max={podLine.toNumber()}
              initialState={0}
            />
          </Box>
        </FieldWrapper>
        <Field name="placeInLine">
          {(fieldProps: FieldProps) => (
            <TokenInputField
              {...fieldProps}
              placeholder={displayFullBN(podLine, 0).toString()}
              balance={podLine}
              balanceLabel="Pod Line Size"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Stack sx={{ pr: 0 }} alignItems="center">
                      <Typography color={BeanstalkPalette.black} sx={{ mt: 0.09, mr: -0.2, fontSize: '1.5rem' }}>0
                        -
                      </Typography>
                    </Stack>
                  </InputAdornment>)
              }}
            />
          )}
        </Field>
        <FieldWrapper label="Price Per Pod" tooltip={POD_MARKET_TOOLTIPS.pricePerPod}>
          <Field name="pricePerPod">
            {(fieldProps: FieldProps) => (
              // FIXME: delete InputField and use TokenInputField
              <TokenInputField
                {...fieldProps}
                placeholder="0.0000"
                balance={new BigNumber(1)}
                balanceLabel="Maximum Price Per Pod"
                InputProps={{
                  inputProps: { step: '0.01' },
                  endAdornment: (
                    <TokenAdornment
                      token={BEAN[1]}
                    />
                  )
                }}
              />
            )}
          </Field>
        </FieldWrapper>
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
        <Button sx={{ p: 1, height: '60px' }} type="submit" disabled>
          Create Order
        </Button>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const BuyOrder : React.FC<{}> = () => {
  const Eth = useChainConstant(ETH);

  const initialValues: BuyOrderFormValues = useMemo(() => ({
    placeInLine: null,
    pricePerPod: null,
    tokens: [
      {
        token: Eth,
        amount: null,
      },
    ],
  }), [Eth]);
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );
  
  // eslint-disable-next-line unused-imports/no-unused-vars
  const onSubmit = useCallback((values: BuyOrderFormValues, formActions: FormikHelpers<BuyOrderFormValues>) => {
    Promise.resolve();
  }, []);
  
  return (
    <Formik<BuyOrderFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<BuyOrderFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <BuyOrderForm
            token={BEAN[1]}
            podLine={beanstalkField.totalPods.minus(beanstalkField.harvestableIndex)}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default BuyOrder;
