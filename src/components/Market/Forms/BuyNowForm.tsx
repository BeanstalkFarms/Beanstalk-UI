import React, { useCallback, useState } from 'react';
import { Form, FormikProps } from 'formik';
import { Box, Button, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { BuyOrderFormValues } from '../Dialogs/BuyOrderDialog';
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
import { BuyNowFormValues } from '../Dialogs/BuyNowDialog';
import { ERC20Token, NativeToken } from 'classes/Token';
import FieldWrapper from "../../Common/Form/FieldWrapper";

export type BuyNowFormProps = {
  token: NativeToken | ERC20Token
}

const BuyNowForm: React.FC<
  BuyNowFormProps & 
  FormikProps<BuyNowFormValues>
> = ({
  values,
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

export default BuyNowForm;
