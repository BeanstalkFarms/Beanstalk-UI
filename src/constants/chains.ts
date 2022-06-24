import ethereumLogoUrl from 'img/tokens/eth-logo.svg';

export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  ASTRO = 6074,
  CUJO = 31337,
  LOCALHOST = 1337,
}

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.MAINNET]: 'Mainnet',
  [SupportedChainId.ROPSTEN]: 'Ropsten',
  [SupportedChainId.ASTRO]: 'Astro',
  [SupportedChainId.LOCALHOST]: 'Localhost',
  [SupportedChainId.CUJO]: 'Cujo',
};

export enum NetworkType {
  L1,
  L2,
}

export const L1_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.ASTRO,
  SupportedChainId.LOCALHOST,
  SupportedChainId.CUJO
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
  [SupportedChainId.ASTRO]: {
    networkType: NetworkType.L1,
    explorer: 'https://etherscan.io',
    label: 'Astro',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Astro Ether', symbol: 'astroETH', decimals: 18 },
  },
  [SupportedChainId.LOCALHOST]: {
    networkType: NetworkType.L1,
    explorer: 'https://etherscan.io',
    label: 'Localhost',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Localhost Ether', symbol: 'locETH', decimals: 18 },
  },
  [SupportedChainId.CUJO]: {
    networkType: NetworkType.L1,
    explorer: 'https://etherscan.io',
    label: 'Harhat',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Hardhat Ether', symbol: 'hETH', decimals: 18 },
  }
};
