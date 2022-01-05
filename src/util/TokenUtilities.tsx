import BigNumber from 'bignumber.js';
import {
  BEAN,
  BEANSTALK,
  UNI_V2_ETH_BEAN_LP,
  UNISWAP_V2_ROUTER,
  USDC,
} from 'constants/index';
import BeanLogo from 'img/bean-logo.svg';
import ClaimableIcon from 'img/claimable-icon.svg';
import EthereumLogo from 'img/eth-logo.svg';
import LPLogo from 'img/lp-logo.svg';
import PodLogo from 'img/pod-logo.svg';
import SeedLogo from 'img/seed-logo.svg';
import SiloIcon from 'img/silo-icon.svg';
import StalkLogo from 'img/stalk-logo.svg';
import TransitIcon from 'img/transit-icon.svg';
import UniswapIcon from 'img/uniswap-icon.svg';
import USDCLogo from 'img/usdc-logo.svg';
import BudgetIcon from 'img/treasury-icon.svg';
import { account, txCallback, tokenContract } from './index';

const MAX_UINT256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

export enum CryptoAsset {
  Bean = 0,
  Ethereum,
  LP,
  Usdc,
}
export enum SiloAsset {
  Stalk = 4,
  Seed,
  Bean,
  LP,
}
export enum TransitAsset {
  Bean = 8,
  LP,
}
export enum FarmAsset {
  Pods = 10,
}
export enum ClaimableAsset {
  Bean = 11,
  LP,
  Ethereum,
  Stalk,
}
export enum UniswapAsset {
  Bean = 15,
}
export enum BudgetAsset {
  Bean = 16,
}
export type Token =
  | CryptoAsset
  | SiloAsset
  | FarmAsset
  | ClaimableAsset
  | TransitAsset
  | UniswapAsset
  | BudgetAsset;

export const transferBeans = async (
  to: string,
  amount: BigNumber,
  callback
) => {
  tokenContract(BEAN)
    .transfer(to, amount)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const approveToken = async (
  token,
  address: String,
  spender: String,
  amount: String,
  callback: (number) => void
) => {
  tokenContract(token)
    .approve(spender, amount)
    .then((response) => {
      callback(1);
      response.wait().then(() => {
        callback(2);
      });
    });
};

export const approveUniswapBean = async (callback) => {
  approveToken(BEAN, account, UNISWAP_V2_ROUTER, MAX_UINT256, callback);
};

export const approveBeanstalkBean = async (callback) => {
  approveToken(BEAN, account, BEANSTALK.addr, MAX_UINT256, callback);
};

export const approveBeanstalkLP = async (callback) => {
  approveToken(
    UNI_V2_ETH_BEAN_LP,
    account,
    BEANSTALK.addr,
    MAX_UINT256,
    callback
  );
};

export const approveBeanstalkUSDC = async (callback) => {
  approveToken(USDC, account, BEANSTALK.addr, MAX_UINT256, callback);
};

export function TokenLabel(tokenType: Token): string {
  switch (tokenType) {
    case CryptoAsset.Bean:
      return 'Beans';
    case CryptoAsset.Ethereum:
      return 'ETH';
    case CryptoAsset.LP:
      return 'LP';
    case CryptoAsset.Usdc:
      return 'USDC';
    case SiloAsset.Stalk:
      return 'Stalk';
    case SiloAsset.Seed:
      return 'Seeds';
    case SiloAsset.Bean:
      return 'Deposited Beans';
    case SiloAsset.LP:
      return 'Deposited LP';
    case TransitAsset.Bean:
      return 'Withdrawn Beans';
    case TransitAsset.LP:
      return 'Withdrawn LP';
    case FarmAsset.Pods:
      return 'Pods';
    case ClaimableAsset.Bean:
      return 'Claimable Beans';
    case ClaimableAsset.LP:
      return 'Claimable LP';
    case ClaimableAsset.Ethereum:
      return 'Claimable ETH';
    case ClaimableAsset.Stalk:
      return 'Grown Stalk';
    case UniswapAsset.Bean:
      return 'Pooled Beans';
    case BudgetAsset.Bean:
      return 'Budget Beans';
    default:
      return '';
  }
}

export function TokenImage(tokenType: Token): string {
  switch (tokenType) {
    case ClaimableAsset.Bean:
    case CryptoAsset.Bean:
    case SiloAsset.Bean:
    case TransitAsset.Bean:
    case UniswapAsset.Bean:
    case BudgetAsset.Bean:
      return BeanLogo;

    case ClaimableAsset.Ethereum:
    case CryptoAsset.Ethereum:
      return EthereumLogo;

    case ClaimableAsset.LP:
    case CryptoAsset.LP:
    case SiloAsset.LP:
    case TransitAsset.LP:
      return LPLogo;

    case ClaimableAsset.Stalk:
    case SiloAsset.Stalk:
      return StalkLogo;

    case SiloAsset.Seed:
      return SeedLogo;

    case FarmAsset.Pods:
      return PodLogo;

    case CryptoAsset.Usdc:
      return USDCLogo;
    default:
      return '';
  }
}

export function TokenTypeImage(tokenType: Token): string {
  if (tokenType < 6 || tokenType === 10) return null;
  if (tokenType < 8) return SiloIcon;
  if (tokenType < 10) return TransitIcon;
  if (tokenType < 15) return ClaimableIcon;
  if (tokenType < 16) return UniswapIcon;
  if (tokenType < 17) return BudgetIcon;
}

/** Trim a BigNumber to a set number of decimals. */
export function TrimBN(bn: BigNumber, decimals: number, allowNegative: boolean = false): BigNumber {
  if (typeof bn !== 'object') return new BigNumber(bn);

  const numberString = bn.toString();
  const decimalComponents = numberString.split('.');
  if ((bn.isLessThan(0) && !allowNegative) || decimalComponents.length < 2) return bn;

  // If too many decimals are provided, trim them.
  // If there aren't enough decimals, do nothing.
  // 1.123456 => [1, 123456]
  const decimalsFound = decimalComponents[1].length;
  const decimalsToTrim = decimalsFound < decimals ? 0 : decimalsFound - decimals;

  return new BigNumber(
    numberString.substr(0, numberString.length - decimalsToTrim)
  );
}

export function displayFullBN(bn: BigNumber, maxDecimals: number = 18) {
  return bn
    .toNumber()
    .toLocaleString('en-US', { maximumFractionDigits: maxDecimals });
}

export function displayBN(bn: BigNumber, allowNegative: Boolean = false) {
  if (bn === undefined) return '0';
  if (bn.isLessThan(new BigNumber(0))) {
    return allowNegative ? `-${displayBN(bn.multipliedBy(-1))}` : '0';
  }
  if (bn.isEqualTo(0)) {
    return '0';
  }
  if (bn.isLessThanOrEqualTo(1e-8)) {
    return '<.00000001';
  }
  if (bn.isLessThanOrEqualTo(1e-3)) {
    return TrimBN(bn, 8).toFixed();
  }

  if (bn.isGreaterThanOrEqualTo(1e12)) {
    return `${TrimBN(bn.dividedBy(1e12), 4)}T`; /* Trillions */
  }
  if (bn.isGreaterThanOrEqualTo(1e9)) {
    return `${TrimBN(bn.dividedBy(1e9), 3)}B`; /* Billions */
  }
  if (bn.isGreaterThanOrEqualTo(1e8)) {
    return `${TrimBN(bn.dividedBy(1e6), 1)}M`; /* Millions */
  }
  if (bn.isGreaterThanOrEqualTo(1e6)) {
    return `${TrimBN(bn.dividedBy(1e6), 2)}M`; /* Millions */
  }
  if (bn.isGreaterThanOrEqualTo(1e3)) {
    return `${displayFullBN(bn, 0)}`; /* Small Thousands */
  }

  const decimals = bn.isGreaterThan(10) ? 2 : bn.isGreaterThan(1) ? 3 : 4;
  return TrimBN(bn, decimals).toFixed();
}

export function smallDecimalPercent(bn: BigNumber) {
  if (bn.isLessThanOrEqualTo(1e-4)) return '<.0001';
  // if (bn.isLessThanOrEqualTo(1e-4)) return bn.toFixed(5);
  if (bn.isLessThanOrEqualTo(1e-3)) return bn.toFixed(4);
  return TrimBN(bn, 3).toFixed();
}

export function MinBNs(array): BigNumber {
  return array.reduce((prev, curr) => {
    if (prev.isLessThanOrEqualTo(curr)) {
      return prev;
    }
    return curr;
  });
}

export function MaxBNs(array): BigNumber {
  return array.reduce((prev, curr) => (prev.isGreaterThan(curr) ? prev : curr));
}

export function MinBN(bn1: BigNumber, bn2: BigNumber): BigNumber {
  if (bn1.isLessThanOrEqualTo(bn2)) return bn1;
  return bn2;
}

export function MaxBN(bn1: BigNumber, bn2: BigNumber): BigNumber {
  if (bn1.isGreaterThan(bn2)) return bn1;
  return bn2;
}

export function toBaseUnitBN(
  rawAmt: string | number | BigNumber,
  decimals: number
): BigNumber {
  const raw = new BigNumber(rawAmt);
  const base = new BigNumber(10);
  const decimalsBN = new BigNumber(decimals);
  return raw.multipliedBy(base.pow(decimalsBN)).integerValue();
}

export function toStringBaseUnitBN(
  rawAmt: string | number | BigNumber,
  decimals: number
): BigNumber {
  const raw = new BigNumber(rawAmt);
  const base = new BigNumber(10);
  const decimalsBN = new BigNumber(decimals);
  return raw.multipliedBy(base.pow(decimalsBN)).integerValue().toString();
}

export function toTokenUnitsBN(
  tokenAmt: string | number | BigNumber,
  decimals: number
): BigNumber {
  const amt = new BigNumber(tokenAmt);
  const digits = new BigNumber(10).pow(new BigNumber(decimals));
  return amt.div(digits);
}
