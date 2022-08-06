import BigNumber from 'bignumber.js';

export type Barn = {
  remaining: BigNumber;
  totalRaised: BigNumber;
  humidity: BigNumber;
  currentBpf: BigNumber;
  endBpf: BigNumber;
  /**
   * The total number of Unfertilized Sprouts remaining.
   */
  unfertilized: BigNumber;
}
