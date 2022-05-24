import BigNumber from 'bignumber.js';
import { UniswapV2Pair__factory } from 'constants/generated';
import { MinBN } from 'util';
import client from 'util/wagmi';
import Dex from './Dex';
import Token, { ERC20Token } from './Token';

type Reserves = [BigNumber, BigNumber];

/**
 * A Pool is an AMM liquidity pool between at least 2 tokens.
 */
export default abstract class Pool {
  /**
   * The contract address on the chain on which this token lives
   */
  public readonly address: string;

  /**
   * The chain ID on which this currency resides
   */
  public readonly chainId: number;

  /**
   * The liquidity token associated with the pool
   */
  public readonly lpToken: ERC20Token;

  /**
   * The liquidity token associated with the pool
   */
  public readonly tokens: ERC20Token[];

  /**
   * The decentralized exchange associated with the pool
   */
  public readonly dex: Dex;

  /**
   * The name of the currency, i.e. a descriptive textual non-unique identifier
   */
  public readonly name: string;

  /**
   * The symbol of the currency, i.e. a short textual non-unique identifier
   */
  public readonly symbol: string;

  /**
   * The name of the currency, i.e. a descriptive textual non-unique identifier
   */
  public readonly logo: string;

  /**
   * @param chainId the chain ID on which this currency resides
   * @param decimals decimals of the currency
   * @param symbol symbol of the currency
   * @param name of the currency
   */
  constructor(
    address: string,
    chainId: number,
    dex: Dex,
    lpToken: ERC20Token,
    tokens: ERC20Token[],
    metadata: {
      name: string,
      symbol: string,
      logo: string,
    }
  ) {
    this.address = address;
    this.chainId = chainId;
    this.dex = dex;
    this.lpToken = lpToken;
    this.tokens = tokens;

    this.name = metadata.name;
    this.symbol = metadata.symbol;
    this.logo = metadata.logo;
  }

  /**
   * Returns whether this currency is functionally equivalent to the other currency
   * @param other the other currency
   */
  public equals(other: Token): boolean {
    return this.chainId === other.chainId && this.address === other.address;
  }

  /** 
   * Used to calculate how much of an underlying reserve a given amount of LP tokens owns in an LP pool.
   * Ownership of reserve tokens is proportional to ownership of LP tokens.
   * 
   * @param amount - the amount of LP tokens the farmer owns
   * @param reserve - the reserve of an asset in the lp pool
   * @param totalLP - the total lp tokens
   * @returns the amount of reserve tokens the farmer owns.
   */
  static tokenForLP = (amount: BigNumber, reserve: BigNumber, totalLP: BigNumber) =>
  amount.multipliedBy(reserve).dividedBy(totalLP);

  /**
   * Used to calcuate the # of reserve tokens owned by a farmer for 2 assets in a pool (e.g. Beans + Eth)
   * Just calls tokenForLP twice.
   */
  static poolForLP = (
    amount: BigNumber,
    reserve1: BigNumber,
    reserve2: BigNumber,
    totalLP: BigNumber
  ) => {
    if (
      amount.isLessThanOrEqualTo(0) ||
      reserve1.isLessThanOrEqualTo(0) ||
      reserve2.isLessThanOrEqualTo(0) ||
      totalLP.isLessThanOrEqualTo(0)
    ) {
      return [new BigNumber(0), new BigNumber(0)];
    }
    return [
      Pool.tokenForLP(amount, reserve1, totalLP),
      Pool.tokenForLP(amount, reserve2, totalLP),
    ];
  };

  /**
   * The opposite of tokenForLP. If a farmer owns/deposits X of reserve asset -> how many LP tokens do they 1 own/get. 
   * 
   * @param amount - the amount of the reserve asset the farmer has
   * @param reserve - the total amount of the reserve asset
   * @param totalLP - the total amount of the LP token
   * @returns the amount of lp tokens that amount corresponds to.
   */
  static lpForToken = (amount: BigNumber, reserve: BigNumber, totalLP: BigNumber) =>
    amount.multipliedBy(totalLP).dividedBy(reserve);

  /**
   * The opposite of poolForLP - used to calculate how many LP tokens a farmer gets if they deposit both reserve assets in a 2 asset pool.
   * e.g. if a farmer deposits amount1 of Beans and amount2 of Eth into an LP pool with reserve1 Beans, reserve2 Eth and totalLP LP tokens, it returns how many LP tokens the farmer gets.
   */
  static lpForPool = (amount1: BigNumber, reserve1: BigNumber, amount2: BigNumber, reserve2: BigNumber, totalLP: BigNumber) =>
    MinBN(
      Pool.lpForToken(amount1, reserve1, totalLP),
      Pool.lpForToken(amount2, reserve2, totalLP)
    );

  abstract getReserves() : Promise<Reserves>;
}

export class UniswapV2Pool extends Pool {
  public getContract() {
    return UniswapV2Pair__factory.connect(this.address, client.provider);
  }
  
  public getReserves() {
    console.debug(`[UniswapV2Pool] getReserves: ${this.address} ${this.name} on chain ${client.provider._network.chainId} via ${client.provider.connection.url}`);
    return (
      this.getContract().getReserves().then((result) => (
        [
          new BigNumber(result._reserve0.toString()), 
          new BigNumber(result._reserve1.toString()),
        ] as Reserves
      ))
    );
  }
}
