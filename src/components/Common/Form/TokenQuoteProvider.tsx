import React, { useEffect, useMemo } from 'react';
import { CircularProgress, TextFieldProps, Typography } from '@mui/material';
import { Token } from 'classes';
import { Field, FieldProps, useFormikContext } from 'formik';
import TokenInputField from 'components/Common/Form/TokenInputField';
import TokenAdornment from 'components/Common/Form/TokenAdornment';
import BigNumber from 'bignumber.js';
import { displayFullBN } from 'util/Tokens';
import useQuote from 'hooks/useQuote';
// import { PinDropSharp } from '@mui/icons-material';
import { FormTokenState } from '.';

const TokenQuoteProvider : React.FC<{
  name: string;
  balance: BigNumber | undefined;
  tokenOut: Token;
  state: FormTokenState;
  showTokenSelect: () => void;
  disableTokenSelect?: boolean;
} & TextFieldProps> = ({
  name,
  balance,
  tokenOut,
  state,
  showTokenSelect,
  disableTokenSelect,
  ...props
}) => {
  // Setup a price quote for this token
  const [amountOut, quoting, getAmountOut] = useQuote(tokenOut);
  const { isSubmitting, setFieldValue } = useFormikContext();

  // Run getAmountOut whenever the amount changes.
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
  }, [state.token, state.amount, getAmountOut, tokenOut]);

  // Store amountOut and quoting in form state.
  // FIXME: Antipattern here? Should we have 
  // a version of `useQuote` that handles this automatically?
  useEffect(() => {
    console.debug(`[TokenQuoteProvider] update ${name}.amountOut => ${amountOut}`);
    setFieldValue(`${name}.amountOut`, amountOut);
  }, [name, setFieldValue, amountOut]);
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
  const Quote = useMemo(() => (
    <>
      {amountOut && (
        <Typography variant="body1" sx={{ fontSize: 13.5 }}>
          = {displayFullBN(amountOut, tokenOut.displayDecimals)} {tokenOut.symbol}
        </Typography>
      )}
      {quoting && (
        <CircularProgress variant="indeterminate" size="small" sx={{ width: 14, height: 14 }} />
      )}
    </>
  ), [amountOut, quoting, tokenOut.displayDecimals, tokenOut.symbol]);

  return (  
    <Field name={`${name}.amount`}>
      {(fieldProps: FieldProps) => (
        <TokenInputField
          {...fieldProps}
          fullWidth
          balance={balance}
          quote={Quote}
          InputProps={InputProps}
          {...props}
        />
      )}
    </Field>
  );
};

export default TokenQuoteProvider;
