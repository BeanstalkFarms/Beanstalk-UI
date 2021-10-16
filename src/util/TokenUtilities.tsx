import BigNumber from 'bignumber.js'
import {
  BEAN,
  BEANSTALK,
  UNI_V2_ETH_BEAN_LP,
  UNISWAP_V2_ROUTER
} from '../constants'
import BeanLogo from '../img/bean-logo.svg'
import ClaimableIcon from '../img/claimable-icon.svg'
import EthereumLogo from '../img/eth-logo.svg'
import LPLogo from '../img/lp-logo.svg'
import PodLogo from '../img/pod-logo.svg'
import SeedLogo from '../img/seed-logo.svg'
import SiloIcon from '../img/silo-icon.svg'
import StalkLogo from '../img/stalk-logo.svg'
import TransitIcon from '../img/transit-icon.svg'
import UniswapIcon from '../img/uniswap-icon.svg'
import BudgetIcon from '../img/treasury-icon.svg'
import { account, txCallback, tokenContract } from './index'

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

export enum CryptoAsset     { Bean = 0, Ethereum, LP }
export enum SiloAsset       { Stalk = 3, Seed, Bean, LP }
export enum TransitAsset    { Bean = 7, LP }
export enum FarmAsset       { Pods = 9 }
export enum ClaimableAsset  { Bean = 10, LP, Ethereum, Stalk }
export enum UniswapAsset    { Bean = 14 }
export enum BudgetAsset     { Bean = 15 }
export type Token = CryptoAsset | SiloAsset | FarmAsset | ClaimableAsset | TransitAsset | UniswapAsset | BudgetAsset

export const transferBeans = async (to: string, amount: BigNumber, callback)  => {
  tokenContract(BEAN).transfer(to, amount).then(response => {
    callback()
    response.wait().then(receipt => { txCallback() })
  })
}

export const approveUniswapBean = async (callback) => {
  approveToken(BEAN, account, UNISWAP_V2_ROUTER, MAX_UINT256, callback)
}

export const approveBeanstalkBean = async (callback) => {
  approveToken(BEAN, account, BEANSTALK.addr, MAX_UINT256, callback)
}

export const approveBeanstalkLP = async (callback) => {
  approveToken(UNI_V2_ETH_BEAN_LP, account, BEANSTALK.addr, MAX_UINT256, callback)
}

export const approveToken = async (token, address: String, spender: String, amount: String, callback: (number) => void) => {
  tokenContract(token).approve(spender, amount).then(response => {
    callback(1)
    response.wait().then(receipt => { callback(2) })
  })
}

export function TokenLabel(tokenType: Token): string {
  switch (tokenType) {
    case CryptoAsset.Bean:
      return 'Beans'
    case CryptoAsset.Ethereum:
      return 'ETH'
    case CryptoAsset.LP:
      return 'LP'
    case SiloAsset.Stalk:
      return 'Stalk'
    case SiloAsset.Seed:
      return 'Seeds'
    case SiloAsset.Bean:
      return 'Deposited Beans'
    case SiloAsset.LP:
      return 'Deposited LP'
    case TransitAsset.Bean:
      return 'Withdrawn Beans'
    case TransitAsset.LP:
      return 'Withdrawn LP'
    case FarmAsset.Pods:
      return 'Pods'
    case ClaimableAsset.Bean:
      return 'Claimable Beans'
    case ClaimableAsset.LP:
      return 'Claimable LP'
    case ClaimableAsset.Ethereum:
      return 'Claimable ETH'
    case ClaimableAsset.Stalk:
      return 'Grown Stalk'
    case UniswapAsset.Bean:
      return 'Pooled Beans'
    case BudgetAsset.Bean:
      return 'Budget Beans'
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
        return BeanLogo

    case ClaimableAsset.Ethereum:
    case CryptoAsset.Ethereum:
      return EthereumLogo

    case ClaimableAsset.LP:
    case CryptoAsset.LP:
    case SiloAsset.LP:
    case TransitAsset.LP:
      return LPLogo

    case ClaimableAsset.Stalk:
    case SiloAsset.Stalk:
      return StalkLogo

    case SiloAsset.Seed:
      return SeedLogo

    case FarmAsset.Pods:
      return PodLogo
  }
}

export function TokenTypeImage(tokenType: Token): string {
  if (tokenType < 5 || tokenType === 9) return null
  if (tokenType < 7) return SiloIcon
  if (tokenType < 9) return TransitIcon
  if (tokenType < 14) return ClaimableIcon
  if (tokenType < 15) return UniswapIcon
  if (tokenType < 16) return BudgetIcon
}

export function TrimBN(bn: BigNumber, decimals: number): BigNumber {
  if (typeof bn !== 'object')
    return new BigNumber(bn)

  const numberString = bn.toString()
  const decimalComponents = numberString.split('.')
  if (bn.isLessThan(0) || decimalComponents.length < 2)
    return bn

  const decimalsFound = decimalComponents[1].length
  const decimalsToTrim = decimalsFound < decimals ? 0 : decimalsFound - decimals
  return new BigNumber(numberString.substr(0, numberString.length - decimalsToTrim))
}

export function displayBN(bn: BigNumber) {
  if (bn === undefined || bn.isLessThan(new BigNumber(0)))
    return '0'
  if(bn.isEqualTo(0))
    return '0'
  if (bn.isLessThanOrEqualTo(1e-8))
    return '<.00000001'
  if (bn.isLessThanOrEqualTo(1e-3))
    return TrimBN(bn, 8).toFixed()

  if (bn.isGreaterThanOrEqualTo(1e12))
    return TrimBN(bn.dividedBy(1e12), 4) + 'T' /* Trillions */
  if (bn.isGreaterThanOrEqualTo(1e9))
    return TrimBN(bn.dividedBy(1e9), 3) + 'B' /* Billions */
  if (bn.isGreaterThanOrEqualTo(1e6))
    return TrimBN(bn.dividedBy(1e6), 2) + 'M' /* Millions */
  if (bn.isGreaterThanOrEqualTo(1e3))
    return TrimBN(bn.dividedBy(1e3), 2) + 'K' /* Thousands */

  const decimals = bn.isGreaterThan(10) ? 2 : bn.isGreaterThan(1) ? 3 : 4
  return TrimBN(bn, decimals).toFixed()
}

export function displayFullBN(bn: BigNumber, maxDecimals: number = 18) {
  return bn.toNumber().toLocaleString('en-US', {maximumFractionDigits: maxDecimals})
}

export function MinBNs(array) : BigNumber {
  return array.reduce(function(prev, curr) {
    return prev.isLessThanOrEqualTo(curr) ? prev : curr
  })
}

export function MaxBNs(array) : BigNumber {
  return array.reduce(function(prev, curr) {
    return prev.isGreaterThan(curr) ? prev : curr
  })
}

export function MinBN(bn1: BigNumber, bn2: BigNumber): BigNumber {
  if (bn1.isLessThanOrEqualTo(bn2))
    return bn1
  else
    return bn2
}

export function MaxBN(bn1: BigNumber, bn2: BigNumber): BigNumber {
  if (bn1.isGreaterThan(bn2))
    return bn1
  else
    return bn2
}

export function toBaseUnitBN(rawAmt: string| number| BigNumber, decimals: number): BigNumber {
  const raw = new BigNumber(rawAmt)
  const base = new BigNumber(10)
  const decimalsBN = new BigNumber(decimals)
  return raw.multipliedBy(base.pow(decimalsBN)).integerValue()
}

export function toStringBaseUnitBN(rawAmt: string| number| BigNumber, decimals: number): BigNumber {
  const raw = new BigNumber(rawAmt)
  const base = new BigNumber(10)
  const decimalsBN = new BigNumber(decimals)
  return raw.multipliedBy(base.pow(decimalsBN)).integerValue().toString()
}

export function toTokenUnitsBN(tokenAmt: string| number| BigNumber, decimals: number): BigNumber {
  const amt = new BigNumber(tokenAmt)
  const digits = new BigNumber(10).pow(new BigNumber(decimals))
  return amt.div(digits)
}
