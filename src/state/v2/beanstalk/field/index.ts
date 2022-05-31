import BigNumber from 'bignumber.js';

export type BeanstalkField = {
  /** */
  harvestableIndex: BigNumber;
  /** */
  pods: BigNumber;
  /** The current soil */
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
