import { BigNumber } from 'bignumber.js';
import Token from 'classes/Token';
import { useCallback, useEffect, useState } from 'react';
import { toTokenUnitsBN } from 'util/Tokens';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';

export type QuoteHandler = (
  tokenIn: Token,
  amountIn: BigNumber,
  tokenOut: Token
) => Promise<BigNumber>; 

export default function useQuote(
  /** */
  tokenOut: Token,
  /** A function that returns a quoted amountOut value. */
  quoteHandler: QuoteHandler,
  /** The number of milliseconds to wait before calling */
  debounceMs : number = 250
) : [
  amountOut: BigNumber | null,
  quoting: boolean,
  refreshAmountOut: (_tokenIn: Token, _amountIn: BigNumber) => void,
] {
  /** The `amountOut` of `tokenOut` received in exchange for `amountIn` of `tokenIn`. */
  const [amountOut, setAmountOut] = useState<BigNumber | null>(null);
  /** Whether we're currently waiting for a quote for this swap. */
  const [quoting, setQuoting] = useState<boolean>(false);
  
  // When token changes, reset the amount.
  useEffect(() => {
    setAmountOut(null);
    setQuoting(false);
  }, [tokenOut]);

  // Below prevents error b/c React can't know the deps of debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _getAmountOut = useCallback(debounce(
    (tokenIn: Token, amountIn: BigNumber) => {
      try {
        return quoteHandler(tokenIn, amountIn, tokenOut)
          // quoteHandler should parse amountOut however it needs to.
          // (i.e. call toTokenUnitsBN or similar)
          .then((_amountOut) => {
            // const _amountOut = toTokenUnitsBN(result.toString(), tokenOut.decimals);
            // console.debug(`[useQuote] got amount out: ${_amountOut?.toString()}`);
            setAmountOut(_amountOut);
            setQuoting(false);
            return _amountOut;
          })
          .catch((e) => {
            toast.error(e.toString());
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
    setAmountOut,
    quoteHandler,
  ]);

  // Handler to refresh
  const getAmountOut = useCallback((tokenIn: Token, amountIn: BigNumber) => {
    if (tokenIn === tokenOut) return;
    if (amountIn.lte(0)) {
      setAmountOut(null);
      setQuoting(false);
    } else {
      setQuoting(true);
      _getAmountOut(tokenIn, amountIn);
    }
  }, [
    tokenOut,
    _getAmountOut,
    setAmountOut,
    setQuoting
  ]);

  return [amountOut, quoting, getAmountOut];
}
