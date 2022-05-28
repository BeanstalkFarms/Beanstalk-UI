import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { SupportedChainId } from 'constants/chains';
import { useNetwork } from 'wagmi';
import { zeroBN } from 'constants/index';

export const INITIAL_HUMIDITY = new BigNumber(5);
export const RESTART_HUMIDITY = new BigNumber(2.50);
export const MIN_HUMIDITY     = new BigNumber(0.2);
export const HUMIDITY_DECREASE_AT_REPLANT = new BigNumber(2.50);
export const HUMIDITY_DECREASE_PER_SEASON = new BigNumber(0.005);
export const REPLANT_SEASON : { [key: number] : BigNumber } = {
  [SupportedChainId.MAINNET]: new BigNumber(6074),
  [SupportedChainId.ROPSTEN]: new BigNumber(564)
};

const useHumidity = () => {
  const { activeChain } = useNetwork();
  const season = useSelector<AppState, AppState['_beanstalk']['sun']['season']>((state) => state._beanstalk.sun.season);
  const replantSeason = REPLANT_SEASON[(activeChain?.id as SupportedChainId) || SupportedChainId.MAINNET];
  
  // Until the end of the first Season after Unpause,
  // the Humidity stays at 500%.
  // const beforeFirstSunrise  = season.eq(replantSeason);
  const endDecreaseSeason   = replantSeason.plus(461);
  const seasonsAfterReplant = season.minus(replantSeason.plus(1));

  // Decrease by 0.5% every season until 20%
  return useMemo(() => {
    if (season.eq(replantSeason))       return [INITIAL_HUMIDITY, HUMIDITY_DECREASE_AT_REPLANT];
    if (season.gte(endDecreaseSeason))  return [MIN_HUMIDITY, zeroBN];
    const humidityDecrease = seasonsAfterReplant.multipliedBy(HUMIDITY_DECREASE_PER_SEASON);
    return [RESTART_HUMIDITY.minus(humidityDecrease), HUMIDITY_DECREASE_PER_SEASON];
  }, [
    season,
    endDecreaseSeason,
    replantSeason,
    seasonsAfterReplant,
  ]);
};

export default useHumidity;
