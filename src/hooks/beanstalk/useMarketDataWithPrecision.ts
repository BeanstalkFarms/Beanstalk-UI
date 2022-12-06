/**
 * used to decide bucket sizes for orderbook
 */
export type OrderbookPrecision = 0.1 | 0.05 | 0.01;

export default function useMarketDataWithPrecision(
  precision: OrderbookPrecision
) {}
