import React, { useEffect, useMemo } from 'react';
import { CircularProgress, TextFieldProps, Typography } from '@mui/material';
import { Token } from 'classes';
import { Field, FieldProps, useFormikContext } from 'formik';
import TokenInputField, { TokenInputProps } from 'components/Common/Form/TokenInputField';
import TokenAdornment from 'components/Common/Form/TokenAdornment';
import BigNumber from 'bignumber.js';
import { displayFullBN } from 'util/Tokens';
import useQuote, { QuoteHandler } from 'hooks/useQuote';
import { FormState, FormTokenState } from '.';
import { ERC20Token, NativeToken } from 'classes/Token';

type TokenQuoteProviderCustomProps = {
  /** Field name */
  name: string;
  /** Input state */
  state: FormTokenState;
  /** Token which we're quoting to. Required to display a proper `amountOut` below the input. */
  tokenOut: ERC20Token | NativeToken;
  /** Handler to show token select */
  showTokenSelect?: () => void;
  /** Disable the token selector button inside the input. */
  disableTokenSelect?: boolean;
  /** */
  handleQuote: QuoteHandler;
};
type TokenQuoteProviderProps = (
  TokenQuoteProviderCustomProps
  & Partial<TokenInputProps>
);

const TokenQuoteProvider : React.FC<TokenQuoteProviderProps> = ({
  // Custom
  name,
  state,
  balance,
  tokenOut,
  showTokenSelect,
  disableTokenSelect,
  handleQuote,
  // 
  ...props
}) => {
  // Setup a price quote for this token
  const [result, quoting, getAmountOut] = useQuote(tokenOut, handleQuote);
  const { isSubmitting, setFieldValue } = useFormikContext<FormState>();

  // Run getAmountOut selected token changes.
  // ------------------------------------------
  // NOTE: because the getAmountOut function is debounced,
  // it returns undefined in some cases, so instead we 
  // listen for changes to `amountOut` and `quouting`
  // via effects and update form state accordingly.
  useEffect(() => {
    if (state.token !== tokenOut) {
      console.debug(`[TokenQuoteProvider] getting amount out: ${state.amount} ${state.token.symbol} => X ${tokenOut.symbol}`);
      getAmountOut(
        state.token,                      // tokenIn
        new BigNumber(state.amount || 0)  // amountIn
      );
    }
  }, [
    state.token,
    state.amount,
    getAmountOut,
    tokenOut
  ]);

  // Store amountOut and quoting in form state.
  // ------------------------------------------
  // FIXME: Antipattern here? Should we have 
  // a version of `useQuote` that handles this automatically?
  useEffect(() => {
    console.debug(`[TokenQuoteProvider] update ${name}.amountOut => ${result}`);
    setFieldValue(`${name}.amountOut`, result?.amountOut);
    setFieldValue(`${name}.steps`, result?.steps);
  }, [name, setFieldValue, result]);
  useEffect(() => {
    console.debug(`[TokenQuoteProvider] update ${name}.quoting => ${quoting}`);
    setFieldValue(`${name}.quoting`, quoting);
  }, [name, setFieldValue, quoting]);

  // Memoized token adornment
  const InputProps = useMemo(() => ({
    endAdornment: (
      <TokenAdornment
        token={state.token}
        onClick={showTokenSelect}
        disabled={isSubmitting || disableTokenSelect}
        sx={{ 
          // TEMP:
          // Before Unpause, grey out the token selector
          // if `disableTokenSelect` is provided; also
          // reduce the opacity to make it less obvious.
          opacity: disableTokenSelect ? 0.3 : 1,
        }}
      />
    )
  }), [
    state.token,
    showTokenSelect,
    isSubmitting,
    disableTokenSelect
  ]);

  // Render info about the quote beneath the input.
  // use state.amountOut instead of amountOut to hide Quote display
  // when the user switches selected tokens.
  const Quote = useMemo(() => (
    <>
      {state.amountOut && (
        <Typography variant="body1" sx={{ fontSize: 13.5 }}>
          ≈ {displayFullBN(state.amountOut, tokenOut.displayDecimals)} {tokenOut.symbol}
        </Typography>
      )}
      {quoting && (
        <CircularProgress variant="indeterminate" size="small" sx={{ width: 14, height: 14 }} />
      )}
    </>
  ), [
    state.amountOut,
    quoting,
    tokenOut.displayDecimals,
    tokenOut.symbol
  ]);

  return (  
    <TokenInputField
      name={`${name}.amount`}
      // MUI
      fullWidth
      InputProps={InputProps}
      {...props}
      // Other
      balance={balance}
      quote={Quote}
      token={state.token}
    />
  );
};

export default TokenQuoteProvider;
