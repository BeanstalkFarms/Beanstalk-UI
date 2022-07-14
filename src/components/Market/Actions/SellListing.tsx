import { Box, Button, InputAdornment, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import {
  FormState, FormTokenState,
  SettingInput,
  TokenQuoteProvider,
  TokenSelectDialog,
  TxnSettings
} from 'components/Common/Form';
import { BeanstalkReplanted } from 'generated/index';
import { SupportedChainId } from 'constants/index';
import { BEAN, ETH, WETH } from 'constants/tokens';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useChainId from 'hooks/useChain';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import { QuoteHandler } from 'hooks/useQuote';
import useTokenMap from 'hooks/useTokenMap';
import Farm from 'lib/Beanstalk/Farm';
import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { toStringBaseUnitBN, toTokenUnitsBN } from 'util/index';
import { useProvider, useSigner } from 'wagmi';
import FieldWrapper from '../../Common/Form/FieldWrapper';
import SliderField from '../../Common/Form/SliderField';
import InputField from '../../Common/Form/InputField';
import { BeanstalkPalette } from '../../App/muiTheme';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import beanIcon from '../../../img/tokens/bean-logo-circled.svg';
import useCurve from '../../../hooks/useCurve';

export type SellListingFormValues = {
  placeInLine: BigNumber | null;
  pricePerPod: BigNumber | null;
  tokens: FormTokenState[];
}

const SellListingForm : React.FC<
  FormikProps<SellListingFormValues>
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
            <InputField
              {...fieldProps}
              minValue={new BigNumber(0)}
              placeholder={podLine.toNumber().toString()}
              maxValue={podLine}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Stack sx={{ pr: 0 }} alignItems="center">
                      {/* <img src={podsIcon} alt="" height="30px" /> */}
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
              <InputField
                {...fieldProps}
                placeholder="0.0000"
                showMaxButton
                InputProps={{
                  inputProps: { step: '0.01' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" gap={0.3} alignItems="center" sx={{ pr: 1 }}>
                        <img src={beanIcon} alt="" height="30px" />
                        <Typography sx={{ fontSize: '20px' }}>BEAN</Typography>
                      </Stack>
                    </InputAdornment>)
                }}
                maxValue={new BigNumber(1)}
                minValue={new BigNumber(0)}
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
        <Button sx={{ p: 1 }} type="submit" disabled>
          Create Order
        </Button>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const PREFERRED_TOKENS : PreferredToken[] = [
  {
    token: BEAN,
    minimum: new BigNumber(1),    // $1
  },
  {
    token: ETH,
    minimum: new BigNumber(0.001) // ~$2-4
  },
  {
    token: WETH,
    minimum: new BigNumber(0.001) // ~$2-4
  }
];

const SellListing : React.FC<{}> = () => {
  const Eth = useChainConstant(ETH);

  const initialValues: SellListingFormValues = useMemo(() => ({
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

  const onSubmit = useCallback((values: SellListingFormValues, formActions: FormikHelpers<SellListingFormValues>) => {
    Promise.resolve();
  }, []);

  return (
    <Formik<SellListingFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<SellListingFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <SellListingForm
            token={BEAN[1]}
            podLine={beanstalkField.totalPods.minus(beanstalkField.harvestableIndex)}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default SellListing;
