import { BigNumber } from 'bignumber.js';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import { useCallback, useEffect, useState } from 'react';
import { toTokenUnitsBN } from 'util/Tokens';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';
import { ChainableFunctionResult } from 'lib/Beanstalk/Farm';

export type QuoteHandlerResult = {
  amountOut: BigNumber;
  steps?: ChainableFunctionResult[];
};
export type QuoteHandler = (
  tokenIn: ERC20Token | NativeToken,
  amountIn: BigNumber,
  tokenOut: ERC20Token | NativeToken
) => Promise<QuoteHandlerResult['amountOut'] | QuoteHandlerResult>; 

export default function useQuote(
  /** */
  tokenOut: ERC20Token | NativeToken,
  /** A function that returns a quoted amountOut value. */
  quoteHandler: QuoteHandler,
  /** The number of milliseconds to wait before calling */
  debounceMs : number = 250
) : [
  result: QuoteHandlerResult | null,
  quoting: boolean,
  refreshAmountOut: (_tokenIn: ERC20Token | NativeToken, _amountIn: BigNumber) => void,
] {
  const [result, setResult] = useState<QuoteHandlerResult | null>(null);
  /** Whether we're currently waiting for a quote for this swap. */
  const [quoting, setQuoting] = useState<boolean>(false);
  
  // When token changes, reset the amount.
  useEffect(() => {
    setResult(null);
    setQuoting(false);
  }, [tokenOut]);

  // Below prevents error b/c React can't know the deps of debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _getAmountOut = useCallback(debounce(
    (tokenIn: ERC20Token | NativeToken, amountIn: BigNumber) => {
      try {
        return quoteHandler(tokenIn, amountIn, tokenOut)
          // quoteHandler should parse amountOut however it needs to.
          // (i.e. call toTokenUnitsBN or similar)
          .then((_result) => {
            // const _amountOut = toTokenUnitsBN(result.toString(), tokenOut.decimals);
            // console.debug(`[useQuote] got amount out: ${_amountOut?.toString()}`);
            setResult(_result instanceof BigNumber ? { amountOut: _result } : _result);
            setQuoting(false);
            return _result;
          })
          .catch((e) => {
            toast.error(e.toString());
            console.error(e);
            setQuoting(false);
          });
      } catch (e : any) {
        setQuoting(false);
        console.error(e);
        toast.error(e?.toString());
      }
    },  
    debounceMs,
    { trailing: true }
  ), [
    tokenOut,
    setQuoting,
    setResult,
    quoteHandler,
  ]);

  // Handler to refresh
  const getAmountOut = useCallback((tokenIn: ERC20Token | NativeToken, amountIn: BigNumber) => {
    if (tokenIn === tokenOut) return;
    if (amountIn.lte(0)) {
      setResult(null);
      setQuoting(false);
    } else {
      setQuoting(true);
      _getAmountOut(tokenIn, amountIn);
    }
  }, [
    tokenOut,
    _getAmountOut,
    setResult,
    setQuoting
  ]);

  return [result, quoting, getAmountOut];
}
