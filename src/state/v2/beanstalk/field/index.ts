import BigNumber from 'bignumber.js';

export type BeanstalkField = {
  /** The number of Pods that have become Harvestable. */
  harvestableIndex: BigNumber;
  /** The total number of outstanding Pods. */
  pods: BigNumber;
  /** The amount of available Soil. */
  soil: BigNumber;
  /** The weather */
  weather: {
    didSowBelowMin: boolean;
    didSowFaster: boolean;
    lastDSoil: BigNumber;
    lastSoilPercent: BigNumber;
    lastSowTime: BigNumber;
    nextSowTime: BigNumber;
    startSoil: BigNumber;
    yield: BigNumber;
  };

  // ------------------------------------------

  rain: {
    /** Whether it is raining or not. */
    raining: Boolean;
    /** The season that it started raining. */
    rainStart: BigNumber;
  }
}
