import ethereumLogoUrl from 'img/tokens/eth-logo.svg';

/**
 * Guide to adding a new chain:
 * 1. Pick a chainId and add to SupportedChainId
 * 2. Add to REPLANTED_CHAINS and TESTNET_CHAINS if appropriate
 * 3. If this is an unofficial testnet, add a RPC URL to TESTNET_RPC_ADDRESSES
 * 4. Add a chainInfo entry in subsequent constants
 * 5. If this contract uses a different ABI for some contracts, add those in `useContract`
 */

/**
 * List of supported chains
 */
export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  ASTRO = 6074,     // pre-exploit, no changes
  PHOENIX = 6075,   // pre-exploit, beanstalk replanted + migration script
  CUJO = 31337,     // pre-exploit, beanstalk replanted
  LOCALHOST = 1337,
}

/**
 * These chains use Beanstalk Replanted, which has different
 * function signatures than the Beanstalk V1.
 */
export const REPLANTED_CHAINS = new Set([
  SupportedChainId.LOCALHOST,
  SupportedChainId.CUJO,
  SupportedChainId.PHOENIX,
]);

/**
 * These chains are forks of mainnet,
 * therefore they use the same token addresses as mainnet.
 */
export const TESTNET_CHAINS = new Set([
  SupportedChainId.LOCALHOST,
  SupportedChainId.ASTRO,
  SupportedChainId.PHOENIX,
  SupportedChainId.CUJO,
]);

/**
 * Unofficial testnets require a custom RPC URL.
 * Ropsten, Goerli etc. are supported by Alchemy.
 */
export const TESTNET_RPC_ADDRESSES : { [chainId: number] : string } = {
  [SupportedChainId.LOCALHOST]: 'http://localhost:8545',
  [SupportedChainId.ASTRO]:     'https://astro.node.bean.money',
  [SupportedChainId.PHOENIX]:   'https://phoenix.node.bean.money',
  [SupportedChainId.CUJO]:      'https://bean-rpc.treetree.finance',
};

// ---------------------------------

export enum NetworkType {
  L1,
  L2,
}

export const L1_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.ASTRO,
  SupportedChainId.PHOENIX,
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

/**
 * FIXME: this was forked from Uniswap's uI but we only use `explorer` here.
 */
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
  [SupportedChainId.PHOENIX]: {
    networkType: NetworkType.L1,
    explorer: 'https://etherscan.io',
    label: 'Phoenix',
    logoUrl: ethereumLogoUrl,
    nativeCurrency: { name: 'Phoenix Ether', symbol: 'phoenixETH', decimals: 18 },
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
