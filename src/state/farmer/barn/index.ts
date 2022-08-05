import BigNumber from 'bignumber.js';

export type FarmerBarn = {
  /** 
   * Fertilizer ERC1155 tokens. The key is a token ID,
   * value is the amount of that ID owned by the Farmer.
   * In Beanstlak this is referred to as "Fertilized".
   */
  fertilizer: {
    [id: string]: BigNumber;
  };

  /**
   * The total number of [Unfertilized] Sprouts held by the Farmer.
   * This is the total number of Beans still owed to the Farmer.
   */
  unfertilizedSprouts: BigNumber;

  /**
   * The total number of Fertilized Sprouts that can be Rinsed by the Farmer.
   * When the Farmer calls `rinse()` this is reset to 0.
   */
  fertilizedSprouts: BigNumber;
}
