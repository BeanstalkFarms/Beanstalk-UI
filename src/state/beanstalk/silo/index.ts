import BigNumber from 'bignumber.js';
import {Deposit, FarmerSiloBalance, Withdrawal} from '../../farmer/silo';
import {TokenMap} from "../../../constants";

/**
 * A "Silo Balance" provides all information
 * about a Farmer's ownership of a Whitelisted Silo Token.
 */
export type BeanstalkSiloBalance = {
  deposited: {
    /** The total amount of this Token currently in the Deposited state. */
    amount: BigNumber;
    /** The BDV of this Token currently in the Deposited state. */
    bdv: BigNumber;
  };
  withdrawn: {
    /** The total amount of this Token currently in the Withdrawn state. */
    amount: BigNumber;
    /** ??? */
    bdv: BigNumber;
  };
  // claimable: BigNumber;
  // wrapped: BigNumber;
  // circulating: BigNumber;
}

/**
 * "Silo Balances" track the detailed balances of
 * all whitelisted Silo tokens, including the amount
 * of each token deposited, claimable, withdrawn, and circulating.
 *
 * FIXME: enforce that `address` is a key of whitelisted tokens?
 */
export type BeanstalkSiloBalances = {
  tokens: TokenMap<BeanstalkSiloBalance>;
}

/**
 * "Silo Assets" are rewards earned for 
 * holding tokens in the Silo.
 */
export type BeanstalkSiloAssets = {
  beans: {
    earned: BigNumber;
    total: BigNumber;
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
  BeanstalkSiloAssets & BeanstalkSiloBalances
);
