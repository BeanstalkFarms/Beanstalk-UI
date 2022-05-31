import { BigNumber } from 'bignumber.js';
import Token from 'classes/Token';
import { useCallback, useEffect, useState } from 'react';
import { toStringBaseUnitBN, toTokenUnitsBN } from 'util/TokenUtilities';
import debounce from 'lodash/debounce';
import { sleep } from 'util/TimeUtilities';
import { ETH_DECIMALS } from 'constants/v2/tokens';
import { bigNumberResult } from 'util/LedgerUtilities';
import { useBeanstalkFertilizerContract } from './useContract';

export default function useQuote(tokenOut: Token, debounceMs : number = 250) : [
  amountIn: BigNumber | undefined,
  quoting: boolean,
  refreshAmountOut: (_tokenIn: Token, _amountIn: BigNumber) => void,
] {
  /** The `amountOut` of `tokenOut` received in exchange for `amountIn` of `tokenIn`. */
  const [amountOut, setAmountOut] = useState<BigNumber | undefined>(undefined);
  /** Whether we're currently waiting for a quote for this swap. */
  const [quoting, setQuoting] = useState<boolean>(false);
  /** */
  const [fertContract] = useBeanstalkFertilizerContract();
  
  // When token changes, reset the amount.
  useEffect(() => {
    setAmountOut(undefined);
    setQuoting(false);
  }, [tokenOut]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _getAmountOut = useCallback(debounce(
    (tokenIn: Token, amountIn: BigNumber) => {
      if (fertContract) {
        const call = (tokenIn.symbol === 'ETH' || tokenIn.symbol === 'ropETH')
          ? fertContract.callStatic.getUsdcOut(
            toStringBaseUnitBN(amountIn, ETH_DECIMALS),
          ).then(bigNumberResult)
          : sleep(250).then(() => new BigNumber(3000_000000).times(amountIn));

        //
        return call.then((result) => {
          const _amountOut = toTokenUnitsBN(result.toString(), tokenOut.decimals);
          console.debug(`[useQuote] got amount out: ${amountOut?.toString()}`, result);
          setAmountOut(_amountOut);
          setQuoting(false);
          return result;
        });
      }
    },  
    debounceMs,
    { trailing: true }
  ), [
    tokenOut,
    fertContract,
    setQuoting,
    setAmountOut
  ]);

  // Handler to refresh
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
