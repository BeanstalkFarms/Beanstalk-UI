import Token from './Token';
import Dex from './Dex';

/**
 * A Pool is an AMM liquidity pool between at least 2 tokens.
 */
 export default class Pool {
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
    public readonly token?: Token;

    /**
     * The liquidity token associated with the pool
     */
     public readonly tokens?: [Token];

    /**
     * The decentralized exchange associated with the pool
     */
     public readonly dex?: Dex;

     /**
   * The symbol of the currency, i.e. a short textual non-unique identifier
   */
  public readonly symbol?: string;

    /**
     * The name of the currency, i.e. a descriptive textual non-unique identifier
     */
    public readonly name?: string;

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
        token: Token,
        tokens: [Token],
        name?: string,
        symbol?: string,
        logo?: string
    ) {
      this.chainId = chainId;
      this.name = name;
      this.address = address;
      this.logo = logo;
      this.symbol = symbol;
      this.dex = dex;
      this.token = token;
      this.tokens = tokens;
    }

    /**
     * Returns whether this currency is functionally equivalent to the other currency
     * @param other the other currency
     */
    public equals(other: Token): boolean {
      return this.chainId === other.chainId && this.address === other.address;
    }
}
