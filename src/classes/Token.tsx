import BigNumber from 'bignumber.js';
import { ERC20 } from 'constants/generated';
import { erc20TokenContract, provider } from 'util/index';
import { bigNumberResult } from 'util/LedgerUtilities2';

/**
 * A currency is any fungible financial instrument, including Ether, all ERC20 tokens, and other chain-native currencies
 */
export default abstract class Token {
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
  public readonly name: string;

  /**
   * The name of the currency, i.e. a descriptive textual non-unique identifier
   */
  public readonly logo?: string;

  /**
   * The name of the currency, i.e. a descriptive textual non-unique identifier
   */
  public readonly slug?: string;

  /**
   * 
   */
  public readonly contract?: any;

  /**
   * @param chainId the chain ID on which this currency resides
   * @param decimals decimals of the currency
   * @param symbol symbol of the currency
   * @param name of the currency
   */
  constructor(address: string, chainId: number, decimals: number, name: string, symbol: string, logo: string, slug?: string) {
    this.chainId = chainId;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
    this.address = address;
    this.logo = logo;
    this.slug = slug;
  }

  /**
   * Returns whether this currency is functionally equivalent to the other currency
   * @param other the other currency
   */
  public equals(other: Token): boolean {
    return this.chainId === other.chainId && this.address === other.address;
  }

  public toString(): string {
    return this.name;
  }

  abstract getBalance(account: string) : Promise<BigNumber> | null;
  
  abstract getTotalSupply() : Promise<BigNumber> | null;
}

export class NativeToken extends Token {
  // eslint-disable-next-line class-methods-use-this
  public getBalance(account: string) {
    return provider.getBalance(account).then(bigNumberResult);
  }

  // eslint-disable-next-line class-methods-use-this
  public getTotalSupply(): Promise<BigNumber> {
    return Promise.resolve(new BigNumber(-1));
  }
}

export class ERC20Token extends Token {
  public readonly contract : ERC20;

  constructor(...args: ConstructorParameters<typeof Token>) {
    super(...args);
    this.contract = erc20TokenContract(this.address);
  }
  
  public getBalance(account: string) {
    return this.contract.balanceOf(account).then(bigNumberResult);
  }

  public getTotalSupply() {
    return this.contract.totalSupply().then(bigNumberResult);
  }
}

export class BeanstalkToken extends Token {
  // constructor(...args: ConstructorParameters<typeof Token>) {
  //   super(...args);
  // }

  // eslint-disable-next-line class-methods-use-this
  public getBalance(account: string) {
    return null;
    // return this.contract.balanceOf(account).then(bigNumberResult);
  }

  // eslint-disable-next-line class-methods-use-this
  public getTotalSupply() {
    return null;
    // return this.contract.totalSupply().then(bigNumberResult);
  }
}