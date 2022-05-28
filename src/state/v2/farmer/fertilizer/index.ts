import BigNumber from 'bignumber.js';

export type FertByID = {
  [key: number]: BigNumber;
}

export type FarmerFertilizer = {
  tokens: FertByID;
}