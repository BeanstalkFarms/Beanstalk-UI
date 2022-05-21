import BigNumber from 'bignumber.js';

// -- Token Balances

export type Deposit = {
  season: BigNumber;
  amount: BigNumber;
  bdv: BigNumber;
  stalk: BigNumber;
  seeds: BigNumber;
}

export type Withdrawal = {
  season: BigNumber;
  amount: BigNumber;
}

export type FarmerTokenBalance = {
  circulating: BigNumber; // The circulating balance in the Farmer's wallet.
  wrapped: BigNumber; // The Farmer's wrapped balance.
  deposited: BigNumber; //
  deposits: Deposit[];
  withdrawn: BigNumber;
  withdrawals: Withdrawal[];
  claimable: BigNumber;
  // claim: Transaction;
}

export type FarmerTokenBalances = {
  // FIXME: enforce that this is a key of whitelisted tokens?
  tokens: { 
    [address: string]: FarmerTokenBalance;
  };
}

// -- Silo Assets

// export type FarmerSiloAsset = {
//   total: BigNumber;
//   active: BigNumber;
//   earned: BigNumber;
//   grown: BigNumber;
// }

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

// --

export type Silo = (
  FarmerTokenBalances 
  & FarmerSiloAssets
);
