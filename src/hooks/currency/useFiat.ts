import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import { BEAN } from 'constants/tokens';
import usePrice from 'hooks/usePrice';
import useSetting from 'hooks/useSetting';
import { useCallback } from 'react';
import { displayBN, displayTokenAmount, displayUSD } from 'util/index';
import useSiloTokenToUSD from './useSiloTokenToUSD';

const useFiat = () => {
  const [denomination] = useSetting('denomination');
  const poolTokenToUSD = useSiloTokenToUSD();
  const price          = usePrice();
  return useCallback((token: Token, amount: BigNumber | undefined, bdv?: BigNumber) => {
    switch (denomination) {
      case 'bdv':
        if (bdv) return displayBN(bdv);
        if (!amount) return '0 BEAN';
        return displayTokenAmount(poolTokenToUSD(token, amount).div(price), BEAN[1]);
      case 'usd':
      default:
        if (!amount) return '$0';
        return displayUSD(poolTokenToUSD(token, amount));
    }
  }, [denomination, poolTokenToUSD, price]);
};

export default useFiat;
