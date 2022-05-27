import BigNumber from 'bignumber.js';

export type Crate = {
  season: BigNumber;
  amount: BigNumber;
}

/**
 * A "Deposit" represents an amount of a Whitelisted Silo Token
 * that has been added to the Silo.
 */
export type Deposit = Crate & {
  bdv: BigNumber;
  stalk: BigNumber;
  seeds: BigNumber;
}

/**
 * A "Withdrawal" represents an amount of a "Deposit"
 * that was removed from the Silo. Withdrawals remain pending
 * for several seasons until they are ready to be Claimed.
 */
export type Withdrawal = Crate & {}

export type FarmerTokenBalance = {
  deposited: {
    total: BigNumber;
    bdv: BigNumber;
    crates: Deposit[];
  };
  withdrawn: {
    total: BigNumber;
    bdv: BigNumber;
    crates: Withdrawal[];
  };
  claimable: BigNumber;
  wrapped: BigNumber;
  circulating: BigNumber;
}

/**
 * A "Farmer Token Balance" provides all information
 * about a farmer's ownership of a whitelisted Silo token.
 */
// export type FarmerTokenBalance = {
//   circulating: BigNumber; // The circulating balance in the Farmer's wallet.
//   wrapped: BigNumber; // The Farmer's wrapped balance.
//   deposited: BigNumber; //
//   deposits: Deposit[];
//   withdrawn: BigNumber;
//   withdrawals: Withdrawal[];
//   claimable: BigNumber;
// }

/**
 * "Farmer Token Balances" track the detailed balances of
 * all whitelisted Silo tokens, including the amount
 * of each token deposited, claimable, withdrawn, and circulating.
 * 
 * FIXME: enforce that `address` is a key of whitelisted tokens?
 */
export type FarmerTokenBalances = {
  tokens: { 
    [address: string]: FarmerTokenBalance;
  };
}

/**
 * "Silo Assets" are rewards earned for 
 * holding tokens in the Silo.
 */
export type FarmerSiloAssets = {
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

export type Silo = (
  FarmerTokenBalances 
  & FarmerSiloAssets
);
