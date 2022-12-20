import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const marketParams = {
  listingId: undefined,
  orderId: undefined,
};

const MARKET_SLUG = 'market';
const BUY_SLUG = 'buy';
const SELL_SLUG = 'sell';

export const useMarketPageUrlUtil = () => {
  const location = useLocation();

  const data = useMemo(() => {
    const path = location.pathname;
    const [action, entityId] = path.split('/').slice(1, 3);
    const isBuy = action === 'buy';
    
    return [action, entityId] as const;
  }, [location.pathname]);

  return data;
};
