import BigNumber from 'bignumber.js';

/**
 * For fertilizer, the ID is also the Season.
 */
export type FertByID = {
  [id: string]: BigNumber;
}

export type FarmerFertilizer = {
  tokens: FertByID;
}
