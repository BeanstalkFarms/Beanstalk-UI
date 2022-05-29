import React, { useEffect, useMemo } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import { Token } from 'classes';
import { Field, FieldProps, useFormikContext } from 'formik';
import TokenInputField from 'components/v2/Common/Form/TokenInputField';
import TokenAdornment from 'components/v2/Common/Form/TokenAdornment';
import BigNumber from 'bignumber.js';
import { displayFullBN } from 'util/TokenUtilities';
import useQuote from 'hooks/useQuote';
// import { PinDropSharp } from '@mui/icons-material';
import { FormTokenState } from '.';

const TokenQuoteProvider : React.FC<{
  name: string;
  balance: BigNumber | undefined;
  tokenOut: Token;
  state: FormTokenState;
  showTokenSelect: () => void;
}> = ({
  name,
  balance,
  tokenOut,
  state,
  showTokenSelect,
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
    console.debug('getAmountOut', state.amount, typeof state.amount);
    getAmountOut(state.token, new BigNumber(state.amount || 0));
  }, [state.token, state.amount, getAmountOut]);

  // Store amountOut and quoting in form state.
  // FIXME: Antipattern here? Should we have 
  // a version of `useQuote` that handles this automatically?
  useEffect(() => {
    setFieldValue(`${name}.amountOut`, amountOut);
  }, [name, setFieldValue, amountOut]);
  useEffect(() => {
    setFieldValue(`${name}.quoting`, quoting);
  }, [name, setFieldValue, quoting]);

  // Memoized token adornment
  const InputProps = useMemo(() => ({
    endAdornment: (
      <TokenAdornment
        token={state.token}
        onClick={showTokenSelect}
        disabled={isSubmitting}
      />
    )
  }), [
    state.token,
    showTokenSelect,
    isSubmitting
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
      {(props: FieldProps) => (
        <TokenInputField
          {...props}
          fullWidth
          balance={balance}
          quote={Quote}
          InputProps={InputProps}
        />
      )}
    </Field>
  );
};

export default TokenQuoteProvider;
