import ethereumLogoUrl from 'img/eth-logo.svg';

export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  LOCALHOST = 1337,
}

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.MAINNET]: 'Mainnet',
  [SupportedChainId.ROPSTEN]: 'Ropsten',
  [SupportedChainId.RINKEBY]: 'Rinkeby',
  [SupportedChainId.GOERLI]: 'Goerli',
  [SupportedChainId.LOCALHOST]: 'Localhost',
};

export enum NetworkType {
  L1,
  L2,
}

export const L1_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  SupportedChainId.GOERLI,
  SupportedChainId.LOCALHOST
] as const;

export const L2_CHAIN_IDS = [] as const;

export type SupportedL1ChainId = typeof L1_CHAIN_IDS[number]
export type SupportedL2ChainId = typeof L2_CHAIN_IDS[number]

interface BaseChainInfo {
  readonly networkType: NetworkType
  readonly blockWaitMsBeforeWarning?: number
  readonly docs?: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink?: string
  readonly logoUrl: string
  readonly label: string
  readonly helpCenterUrl?: string
  readonly nativeCurrency: {
    name: string // e.g. 'Goerli ETH',
    symbol: string // e.g. 'gorETH',
    decimals: number // e.g. 18,
  }
}

export interface L1ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L1
}

export interface L2ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L2
  readonly bridge: string
  readonly statusPage?: string
  readonly defaultListUrl: string
}

export type ChainInfoMap = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo } 
& { readonly [chainId in SupportedL1ChainId]: L1ChainInfo }
& { readonly [chainId in SupportedL2ChainId]: L2ChainInfo }

export const CHAIN_INFO : ChainInfoMap = {
  [SupportedChainId.MAINNET]: {
    networkType: NetworkType.L1,
    explorer: 'https://etherscan.io',
    label: 'Ethereum',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [SupportedChainId.ROPSTEN]: {
    networkType: NetworkType.L1,
    explorer: 'https://ropsten.etherscan.io',
    label: 'Ropsten',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Ropsten Ether', symbol: 'ropETH', decimals: 18 },
  },
  [SupportedChainId.RINKEBY]: {
    networkType: NetworkType.L1,
    explorer: 'https://rinkeby.etherscan.io',
    label: 'Rinkeby',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Rinkeby Ether', symbol: 'rinkETH', decimals: 18 },
  },
  [SupportedChainId.GOERLI]: {
    networkType: NetworkType.L1,
    explorer: 'https://goerli.etherscan.io',
    label: 'Goerli',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Goerli Ether', symbol: 'goerETH', decimals: 18 },
  },
  [SupportedChainId.LOCALHOST]: {
    networkType: NetworkType.L1,
    explorer: '',
    label: 'Localhost',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Localhost Ether', symbol: 'locETH', decimals: 18 },
  }
};
