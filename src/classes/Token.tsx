import BigNumber from 'bignumber.js';
import { AddressMap } from 'constants/v2/addresses';
import { bigNumberResult, MAX_UINT256 } from 'util/LedgerUtilities';
import { beanstalkContract, erc20TokenContract } from 'util/contracts';
import client from 'util/wagmi';
import { zeroBN } from 'constants/index';

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
   * 
   */
  public readonly rewards?: { stalk: number; seeds: number };

  public readonly displayDecimals: number;

  /**
   * @param chainId the chain ID on which this currency resides
   * @param decimals decimals of the currency
   * @param symbol symbol of the currency
   * @param name of the currency
   */
  constructor(
    chainId: number,
    address: AddressMap | string,
    decimals: number,
    metadata: {
      name: string,
      symbol: string,
      logo: string,
      displayDecimals?: number,
    },
    rewards?: {
      stalk: number;
      seeds: number;
    }
  ) {
    this.chainId = chainId;
    this.address = typeof address === 'string' ? address : address[chainId];
    this.decimals = decimals;
    this.symbol = metadata.symbol;
    this.name = metadata.name;
    this.logo = metadata.logo;
    this.displayDecimals = metadata.displayDecimals || 2;
    this.rewards = rewards;
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

  public getStalk(bdv?: BigNumber) : BigNumber {
    if (!this.rewards?.stalk) return zeroBN;
    return (bdv || new BigNumber(1)).times(this.rewards.stalk);
  }
  
  public getSeeds(bdv?: BigNumber) : BigNumber {
    if (!this.rewards?.seeds) return zeroBN;
    return (bdv || new BigNumber(1)).times(this.rewards.seeds);
  }

  abstract getContract() : any;

  abstract getBalance(account: string) : Promise<BigNumber | undefined>;

  abstract getAllowance(account: string, spender: string) : Promise<BigNumber | undefined>;
  
  abstract getTotalSupply() : Promise<BigNumber> | undefined;
}

export class NativeToken extends Token {
  // eslint-disable-next-line class-methods-use-this
  public getContract() {
    return client.provider;
  }

  public getBalance(account: string) : Promise<BigNumber> {
    return this.getContract().getBalance(account).then(
      // No need to convert decimals because ethers does this already
      (result) => bigNumberResult(result)
    );
  }

  // eslint-disable-next-line class-methods-use-this
  public getAllowance(): Promise<BigNumber | undefined> {
    return Promise.resolve(new BigNumber(parseInt(MAX_UINT256, 16)));
  }

  // eslint-disable-next-line class-methods-use-this
  public getTotalSupply() {
    return undefined;
  }
}

export class ERC20Token extends Token {
  public getContract() {
    return erc20TokenContract(this.address);
  }
  
  public getBalance(account: string) {
    console.debug(`[ERC20Token] ${this.symbol} (${this.address}) -> balanceOf(${account})`);
    return this.getContract().balanceOf(account).then(bigNumberResult);
  }

  // eslint-disable-next-line class-methods-use-this
  public getAllowance(account: string, spender: string) {
    return this.getContract().allowance(account, spender).then(bigNumberResult);
  }

  public getTotalSupply() {
    console.debug(`[ERC20Token] ${this.symbol} (${this.address}) -> totalSupply()`);
    return this.getContract().totalSupply().then(bigNumberResult);
  }
}

export class BeanstalkToken extends Token {
  // eslint-disable-next-line class-methods-use-this
  public getContract() {
    return beanstalkContract();
  }

  // eslint-disable-next-line class-methods-use-this
  public getBalance() {
    return Promise.resolve(undefined);
  }

  // eslint-disable-next-line class-methods-use-this
  public getAllowance() {
    return Promise.resolve(new BigNumber(parseInt(MAX_UINT256, 16)));
  }

  // eslint-disable-next-line class-methods-use-this
  public getTotalSupply() {
    return undefined;
  }
}

export type AnyToken = (
  BeanstalkToken
  | ERC20Token
  | NativeToken
);
