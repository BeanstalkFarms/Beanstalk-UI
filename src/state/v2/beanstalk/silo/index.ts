import BigNumber from 'bignumber.js';

/**
 * "Silo Assets" are rewards earned for 
 * holding tokens in the Silo.
 */
export type BeanstalkSiloAssets = {
  beans: {
    earned: BigNumber;
  }
  stalk: {
    total: BigNumber;
    active: BigNumber;
    earned: BigNumber;
    grown: BigNumber;
  };
  seeds: {
    total: BigNumber;
    active: BigNumber;
    earned: BigNumber;
  };
  roots: {
    total: BigNumber;
  };
}

export type BeanstalkSilo = (
  BeanstalkSiloAssets
);
