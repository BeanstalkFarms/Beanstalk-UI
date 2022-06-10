import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { SupportedChainId } from 'constants/chains';
import { ZERO_BN, TokenOrTokenMap } from 'constants/index';
import { bigNumberResult } from './LedgerUtilities';

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

export function displayFullBN(bn: BigNumber, maxDecimals: number = 18, minDecimals : number = 0) {
  return bn
    .toNumber()
    .toLocaleString('en-US', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals
    });
}

export function displayTokenAmount(amount: BigNumber, token: Token) {
  return `${amount
    .toNumber()
    .toLocaleString('en-US', { maximumFractionDigits: token.displayDecimals })} ${token.name}`;
}

export function displayBN(bn: BigNumber, allowNegative: Boolean = false) : string {
  if (bn === undefined || !(bn instanceof BigNumber)) return '0';
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

export function displayUSD(bn: BigNumber, allowNegative : boolean = false) {
  const v = allowNegative === false ? MaxBN(ZERO_BN, bn).abs() : bn;
  return `$${displayFullBN(v, 2, 2)}`;
}

/**
 * Convert a "raw amount" (decimal form) to "token amount" (integer form).
 * This is what's stored in the contract.
 *
 * FIXME: 'base unit' naming?
 *
 * @param rawAmt
 * @param decimals
 * @returns
 */
 export function toBaseUnitBN(
  rawAmt: string | number | BigNumber,
  decimals: number
): BigNumber {
  const amt = new BigNumber(rawAmt);
  const base = new BigNumber(10);
  const decimalsBN = new BigNumber(decimals);
  const digits = base.pow(decimalsBN);
  return amt.multipliedBy(digits).integerValue();
}

/**
 * Convert a "token amount" (integer form) to "raw amount" (decimal form).
 * This is typically what's displayed to users within the application.
 *
 * @param tokenAmt BigNumber.Value
 * @param decimals BigNumber.Value
 * @returns BigNumber
 */
export function toTokenUnitsBN(
  tokenAmt: string | number | BigNumber,  // FIXME: use BigNumber.Value here?
  decimals: number                        // FIXME: use BigNumber.Value here?
): BigNumber {
  const amt = new BigNumber(tokenAmt);
  const base = new BigNumber(10);
  const decimalsBN = new BigNumber(decimals);
  const digits = base.pow(decimalsBN);
  return amt.dividedBy(digits);
}

/**
 *
 * @param rawAmt
 * @param decimals
 * @returns
 */
 export function toStringBaseUnitBN(
  rawAmt: string | number | BigNumber,
  decimals: number
): string {
  return toBaseUnitBN(rawAmt, decimals).toString();
}

export const tokenResult = (_token: TokenOrTokenMap) => {
  // If a mapping is provided, default to MAINNET decimals.
  // ASSUMPTION: the number of decimals are the same across all chains.
  const token = _token instanceof Token ? _token : _token[SupportedChainId.MAINNET];
  return (result: any) => toTokenUnitsBN(
    bigNumberResult(result),
    token.decimals
  );
};
