import BigNumber from 'bignumber.js';
import { UniswapV2Pair, UniswapV2Pair__factory } from 'constants/generated';
import { useBeanstalkContract } from 'hooks/useContract';
import { provider } from 'util/index';
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
  public readonly symbol?: string;

  /**
   * The name of the currency, i.e. a descriptive textual non-unique identifier
   */
  public readonly logo?: string;

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
    lpToken: Token,
    tokens: Token[],
    metadata: {
      name: string,
      symbol?: string,
      logo?: string,
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
