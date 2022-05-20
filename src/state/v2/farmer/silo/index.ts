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

export type UserTokenBalance = {
  circulating: BigNumber; // The circulating balance in the Farmer's wallet.
  wrapped: BigNumber; // The Farmer's wrapped balance.
  deposited: BigNumber; //
  deposits: Deposit[];
  withdrawn: BigNumber;
  withdrawals: Withdrawal[];
  claimable: BigNumber;
  // claim: Transaction;
}

export type UserTokenBalances = {
  // FIXME: enforce that this is a key of whitelisted tokens?
  tokens: { 
    [address: string]: UserTokenBalance;
  };
}

// -- Silo Assets

export type UserSiloAsset = {
  total: BigNumber;
  active: BigNumber;
  earned: BigNumber;
  grown: BigNumber;
}

export type UserSiloAssets = {
  stalk: UserSiloAsset;
  seeds: UserSiloAsset;
  roots: UserSiloAsset;
}

// --

export type Silo = (
  UserTokenBalances 
  & UserSiloAssets
);
