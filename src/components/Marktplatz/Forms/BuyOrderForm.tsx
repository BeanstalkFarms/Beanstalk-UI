import React, { useCallback, useMemo, useState } from 'react';
import { Field, FieldProps, Form, FormikProps } from 'formik';
import { Box, Button, InputAdornment, Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { BuyOrderFormValues } from '../Dialogs/BuyOrderDialog';
import SliderInputField from '../../Common/Form/Field/SliderInputField';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import InputAmountField from '../../Common/Form/Field/InputAmountField';
import { BeanstalkPalette } from '../../App/muiTheme';
import beanIcon from '../../../img/tokens/bean-logo-circled.svg';
import TokenQuoteProvider from '../../Common/Form/TokenQuoteProvider';
import { SupportedChainId } from '../../../constants';
import { Token } from '../../../classes';
import useChainId from '../../../hooks/useChain';
import { QuoteHandler } from '../../../hooks/useQuote';
import { toStringBaseUnitBN, toTokenUnitsBN } from '../../../util';
import useCurve from '../../../hooks/useCurve';
import useFarmerBalances from '../../../hooks/useFarmerBalances';
import TokenSelectDialog from '../../Common/Form/TokenSelectDialog';
import useTokenMap from '../../../hooks/useTokenMap';
import { BEAN, ETH } from '../../../constants/tokens';
import { ERC20Token, NativeToken } from 'classes/Token';

export type BuyOrderFormProps = {
  podLine: BigNumber;
  token: ERC20Token | NativeToken
}

const BuyOrderForm: React.FC<BuyOrderFormProps & FormikProps<BuyOrderFormValues>> = ({
  values,
  podLine,
  setFieldValue,
  isSubmitting,
  token: depositToken// BEAN
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
      {/*<pre>{JSON.stringify({ ...values }, null, 2)}</pre>*/}
      <Stack gap={1}>
        <TokenSelectDialog
          open={showTokenSelect}
          handleClose={handleClose}
          selected={values.tokens}
          handleSubmit={handleSelectTokens}
          balances={balances}
          tokenList={Object.values(erc20TokenMap)}
        />
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Tooltip placement="bottom-start" title="">
              <Typography>Place in Line</Typography>
            </Tooltip>
          </Box>
          <Box px={2}>
            <Field name="placeInLine">
              {(fieldProps: FieldProps) => (
                <SliderInputField
                  {...fieldProps}
                  min={0}
                  max={podLine.toNumber()}
                  initialState={0}
                />
              )}
            </Field>
          </Box>
        </Stack>
        <Box>
          <Field name="placeInLine">
            {(fieldProps: FieldProps) => (
              <InputAmountField
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
        </Box>
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Tooltip placement="bottom-start" title={POD_MARKET_TOOLTIPS.pricePerPod}>
              <Typography>Price Per Pod</Typography>
            </Tooltip>
          </Box>
          <Field name="pricePerPod">
            {(fieldProps: FieldProps) => (
              <InputAmountField
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
        </Stack>
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Typography>Number of Beans</Typography>
          </Box>
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
        </Stack>
        <Button sx={{ p: 1 }} type="submit" disabled>
          Create Order
        </Button>
      </Stack>
    </Form>
  );
};

export default BuyOrderForm;
