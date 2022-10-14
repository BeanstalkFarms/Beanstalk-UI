import { BigNumber } from 'bignumber.js';
import { useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bigNumberResult } from '../../util/Ledger';
import useGetChainToken from '~/hooks/chain/useGetChainToken';
import { DAI, USDC, USDT } from '../../constants/tokens';
import {
  DAI_CHAINLINK_ADDRESSES,
  USDT_CHAINLINK_ADDRESSES,
  USDC_CHAINLINK_ADDRESSES,
} from '../../constants/addresses';
import { useAggregatorV3Contract } from '~/hooks/ledger/useContract';
import { AppState } from '../../state/index';
import { updateTokenPrices } from '~/state/beanstalk/tokenPrices/actions';

const getBNResult = (result: any, decimals: number) => {
  const bnResult = bigNumberResult(result);
  const _decimals = new BigNumber(10).pow(decimals);
  return bnResult.dividedBy(_decimals);
};

export default function useCrvUnderlyingPrices() {
  const tokenPriceMap = useSelector<
    AppState,
    AppState['_beanstalk']['tokenPrices']
  >((state) => state._beanstalk.tokenPrices);

  const daiPriceFeed = useAggregatorV3Contract(DAI_CHAINLINK_ADDRESSES);
  const usdtPriceFeed = useAggregatorV3Contract(USDT_CHAINLINK_ADDRESSES);
  const usdcPriceFeed = useAggregatorV3Contract(USDC_CHAINLINK_ADDRESSES);
  const getChainToken = useGetChainToken();
  const dispatch = useDispatch();

  const fetch = useCallback(async () => {
    if (Object.values(tokenPriceMap).length) return;
    if (!daiPriceFeed || !usdtPriceFeed || !usdcPriceFeed) return;
    console.debug('[beanstalk/tokenPrices/useCrvUnderlylingPrices] FETCH');

    const [
      daiPriceData,
      daiPriceDecimals,
      usdtPriceData,
      usdtPriceDecimals,
      usdcPriceData,
      usdcPriceDecimals,
    ] = await Promise.all([
      daiPriceFeed.latestRoundData(),
      daiPriceFeed.decimals(),
      usdtPriceFeed.latestRoundData(),
      usdtPriceFeed.decimals(),
      usdcPriceFeed.latestRoundData(),
      usdcPriceFeed.decimals(),
    ]);

    const dai = getChainToken(DAI);
    const usdc = getChainToken(USDC);
    const usdt = getChainToken(USDT);

    const priceDataCache: { [address: string]: BigNumber } = {};

    if (daiPriceData && daiPriceDecimals) {
      priceDataCache[dai.address] = getBNResult(
        daiPriceData.answer,
        daiPriceDecimals
      );
    }
    if (usdtPriceData && usdtPriceDecimals) {
      priceDataCache[usdt.address] = getBNResult(
        usdtPriceData.answer,
        usdtPriceDecimals
      );
    }
    if (usdcPriceData && usdcPriceDecimals) {
      priceDataCache[usdc.address] = getBNResult(
        usdcPriceData.answer,
        usdcPriceDecimals
      );
    }

    console.debug(
      `[beanstalk/tokenPrices/useCrvUnderlyingPrices] RESULT: ${priceDataCache}`
    );

    return priceDataCache;
  }, [tokenPriceMap, daiPriceFeed, usdtPriceFeed, usdcPriceFeed, getChainToken]);

  const handleUpdatePrices = useCallback(async () => {
    const prices = await fetch();
    prices && dispatch(updateTokenPrices(prices));
  }, [dispatch, fetch]);

  useEffect(() => {
    handleUpdatePrices();
  }, [handleUpdatePrices]);

  return useMemo(() => ({ ...tokenPriceMap }), [tokenPriceMap]);
}
