import { BigNumber } from 'bignumber.js';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
) => Promise<null | QuoteHandlerResult['amountOut'] | QuoteHandlerResult>; 

export type QuoteSettings = {
  /** The number of milliseconds to wait before calling */
  debounceMs : number;
  /** If true, returns amountOut = amountIn when tokenOut = tokenIn. Otherwise returns void. */
  ignoreSameToken : boolean;
  /** */
  onReset: () => QuoteHandlerResult | null;
}

const baseSettings = {
  debounceMs: 250,
  ignoreSameToken: true,
  onReset: () => null,
};

export default function useQuote(
  /** */
  tokenOut: ERC20Token | NativeToken,
  /** A function that returns a quoted amountOut value. */
  quoteHandler: QuoteHandler,
  _settings?: Partial<QuoteSettings>,
) : [
  result: QuoteHandlerResult | null,
  quoting: boolean,
  refreshAmountOut: (_tokenIn: ERC20Token | NativeToken, _amountIn: BigNumber) => void,
] {
  const [result, setResult]   = useState<QuoteHandlerResult | null>(null);
  const [quoting, setQuoting] = useState<boolean>(false);
  const settings = useMemo(() => ({ ...baseSettings, ..._settings }), [_settings]);
  
  // When token changes, reset the amount.
  useEffect(() => {
    setResult(settings.onReset());
    setQuoting(false);
  }, [tokenOut, settings]);

  // Below prevents error b/c React can't know the deps of debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _getAmountOut = useCallback(debounce(
    (tokenIn: ERC20Token | NativeToken, amountIn: BigNumber) => {
      try {
        return quoteHandler(tokenIn, amountIn, tokenOut)
          // quoteHandler should parse amountOut however it needs to.
          // (i.e. call toTokenUnitsBN or similar)
          .then((_result) => {
            if (!_result === null) {
              return _result;
            }
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
    settings.debounceMs,
    { trailing: true }
  ), [
    tokenOut,
    setQuoting,
    setResult,
    quoteHandler,
  ]);

  // Handler to refresh
  const getAmountOut = useCallback((tokenIn: ERC20Token | NativeToken, amountIn: BigNumber) => {
    // FIXME: this should return amountIn instead of doing nothing
    if (tokenIn === tokenOut) {
      if (settings.ignoreSameToken) return;
      setQuoting(true);
      _getAmountOut(tokenIn, amountIn);
    }
    if (amountIn.lte(0)) {
      setResult(null);
      setQuoting(false);
    } else {
      setQuoting(true);
      _getAmountOut(tokenIn, amountIn);
    }
  }, [
    tokenOut,
    settings.ignoreSameToken,
    _getAmountOut,
    setResult,
    setQuoting
  ]);

  return [result, quoting, getAmountOut];
}
