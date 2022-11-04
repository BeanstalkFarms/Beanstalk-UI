import BigNumber from 'bignumber.js';

export type PodMarketActivityType = {
  id: string;
  date: Date;
  action: 'buy' | 'sell';
  type: 'listing' | 'order';
  priceType: 'dynamic' | 'fixed';
  price: BigNumber;
  amount: BigNumber;
  placeInLine: BigNumber;
  expiry: string;
  fillPct: BigNumber;
  total: BigNumber;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
}

export const useFakePodMarketActivity = (): PodMarketActivityType[] => Array(100).fill(null).map((_, i) => {
    const date = new Date();
    const action = i % 2 === 0 ? 'buy' : 'sell';
    const type = i % 3 === 0 ? 'listing' : 'order';
    const priceType = i % 4 === 0 ? 'dynamic' : 'fixed';
    const price = new BigNumber(i * 0.01);
    const amount = new BigNumber(i * 1000);
    const placeInLine = new BigNumber(i * 1_000_000 * 1.5);
    const expiry = '-';
    const fillPct = new BigNumber(0);
    const total = price.times(amount);
    const status = 'OPEN';
    return {
      id: i.toString(),
      date,
      action,
      type,
      priceType,
      price,
      amount,
      placeInLine,
      expiry,
      fillPct,
      total,
      status
    };
  });
