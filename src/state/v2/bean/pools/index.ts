import BigNumber from 'bignumber.js';

export type BeanPoolState = {
  price: BigNumber;
  reserves: BigNumber[];
  deltaB: BigNumber;
  liquidity: BigNumber;
  totalCrosses: BigNumber;
}
