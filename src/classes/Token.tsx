/**
 * A currency is any fungible financial instrument, including Ether, all ERC20 tokens, and other chain-native currencies
 */
export default class Token {
  /**
   * The contract address on the chain on which this token lives
   */
  public readonly address: string;

  /**
   * The chain ID on which this currency resides
   */
  public readonly chainId: number;

  /**
   * The decimals used in representing currency amounts
   */
  public readonly decimals: number;

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
  constructor(address: string, chainId: number, decimals: number, name?: string, symbol?: string, logo?: string) {
    this.chainId = chainId;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
    this.address = address;
    this.logo = logo;
  }

  /**
   * Returns whether this currency is functionally equivalent to the other currency
   * @param other the other currency
   */
  public equals(other: Token): boolean {
    return this.chainId === other.chainId && this.address === other.address;
  }
}
