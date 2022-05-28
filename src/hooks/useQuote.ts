import { BigNumber } from "bignumber.js";
import Token from "classes/Token";
import { useCallback, useEffect, useState } from "react";
import { toTokenUnitsBN } from "util/TokenUtilities";
import debounce from 'lodash/debounce';
import { sleep } from "util/TimeUtilities";

export default function useQuote(tokenOut: Token) : [
  amountIn: BigNumber | undefined,
  quoting: boolean,
  refreshAmountOut: (_tokenIn: Token, _amountIn: BigNumber) => void,
] {
  /** The `amountOut` of `tokenOut` received in exchange for `amountIn` of `tokenIn`. */
  const [amountOut, setAmountOut] = useState<BigNumber | undefined>(undefined);
  /** Whether we're currently waiting for a quote for this swap. */
  const [quoting, setQuoting] = useState<boolean>(false);

  /**
   * When token changes, reset the amount.
   */
   useEffect(() => {
    setAmountOut(undefined);
    setQuoting(false);
  }, [tokenOut]);

  /**
   * 
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _getAmountOut = useCallback(debounce(
    (tokenIn: Token, amountIn: BigNumber) => sleep(250)
        .then(() => new BigNumber(3000_000000).times(amountIn))
        .then((result) => {
          setAmountOut(toTokenUnitsBN(result.toString(), tokenOut.decimals));
          setQuoting(false);
          return result;
        }),
    1500,
    { trailing: true }
  ), [
    tokenOut,
    setQuoting,
    setAmountOut
  ]);

  /**
   * Handler to refresh
   */
  const getAmountOut = useCallback((tokenIn: Token, amountIn: BigNumber) => {
    if (tokenIn === tokenOut) return;
    if (amountIn.lte(0)) {
      setAmountOut(undefined);
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
