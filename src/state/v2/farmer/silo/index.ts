import BigNumber from 'bignumber.js';
import { TokenMap } from 'constants/index';

/**
 * A Crate is an `amount` of a token Deposited or
 * Withdrawn during a given `season`.
 * 
 * `Deposit` and `Withdrawal` extend Crate.
 */
export type Crate = {
  /** The amount of this Crate that was created, denominated in the underlying Token. */
  amount: BigNumber;
  /** The Season that the Crate was created. */
  season: BigNumber;
}

/**
 * A "Deposit" represents an amount of a Whitelisted Silo Token
 * that has been added to the Silo.
 */
export type Deposit = Crate & {
  /** The BDV of the Deposit is determined upon Deposit. */
  bdv: BigNumber;
  /** The amount of Stalk granted for this Deposit. */
  stalk: BigNumber;
  /** The amount of Seeds granted for this Deposit. */
  seeds: BigNumber;
}

/**
 * A "Withdrawal" represents an amount of a "Deposit"
 * that was removed from the Silo. Withdrawals remain pending
 * for several seasons until they are ready to be Claimed.
 */
export type Withdrawal = Crate & {}

/**
 * A "Silo Balance" provides all information
 * about a Farmer's ownership of a Whitelisted Silo Token.
 */
export type FarmerSiloBalance = {
  deposited: {
    /** The total amount of this Token currently in the Deposited state. */
    amount: BigNumber;
    /** The BDV of this Token currently in the Deposited state. */
    bdv: BigNumber;
    /** All Deposit crates. */
    crates: Deposit[];
  };
  withdrawn: {
    /** The total amount of this Token currently in the Withdrawn state. */
    amount: BigNumber;
    /** ??? */
    bdv: BigNumber;
    /** All Withdrawal crates. */
    crates: Withdrawal[];
  };
  claimable: BigNumber;
  wrapped: BigNumber;
  circulating: BigNumber;
}

/**
 * "Silo Balances" track the detailed balances of
 * all whitelisted Silo tokens, including the amount
 * of each token deposited, claimable, withdrawn, and circulating.
 * 
 * FIXME: enforce that `address` is a key of whitelisted tokens?
 */
export type FarmerSiloBalances = {
  tokens: TokenMap<FarmerSiloBalance>;
}

/**
 * "Silo Rewards" are rewards earned for 
 * holding tokens in the Silo.
 */
export type FarmerSiloRewards = {
  beans: {
    /**
     * The amount of Beans the Farmer has earned 
     * rom their ownership of the Silo.
     */
    earned: BigNumber;
  }
  stalk: {
    /**
     * The total amount of Stalk associated with the Farmer.
     * 
     * `total = active + grown`
     */
    total: BigNumber;
    /**
     * In the case of stalk, ACTIVE includes EARNED.
     */
    active: BigNumber;
    /**
     * Earned Stalk are Stalk granted upon reception of earned 
     * Beans (since 1 Deposited Bean = 1 Stalk). 
     * Earned Stalk are also "active" because it increases 
     * the Farmer's relative ownership in the Silo. 
     */
    earned: BigNumber;
    /**
     * Grown Stalk is Stalk granted each Season from Seeds.
     */
    grown: BigNumber;
  };
  seeds: {
    /**
     * The total amount of Seeds associated with the Farmer.
     * 
     * `total = active`.
     */
    total: BigNumber;
    /**
     * 
     */
    active: BigNumber;
    /** 
     * Earned Seeds are Seeds granted upon reception of 
     * earned Beans (since 1 Deposited Bean = 2 Stalk).
     */
    earned: BigNumber;
    /** There are no "Grown Seeds". */
    // grown: undefined;
  };
  roots: {
    total: BigNumber;
  };
}

export type FarmerSilo = (
  FarmerSiloBalances 
  & FarmerSiloRewards
);
