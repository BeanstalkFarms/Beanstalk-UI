import { SupportedChainId } from './chains';

/**
 * Unofficial testnets require a custom RPC URL.
 * Ropsten, Goerli etc. are supported by Alchemy.
 */
 export const TESTNET_RPC_ADDRESSES : { [chainId: number] : string } = {
  [SupportedChainId.LOCALHOST]: 'http://localhost:8545',
  [SupportedChainId.CUJO]:      'https://bean-rpc.treetree.finance',
};

export const BEANSTALK_SUBGRAPH_ADDRESSES : { [chainId: number] : string } = {
  [SupportedChainId.MAINNET]:   'https://api.thegraph.com/subgraphs/name/cujowolf/beanstalk',
  [SupportedChainId.LOCALHOST]: 'https://api.thegraph.com/subgraphs/name/cujowolf/beanstalk-dev-replanted',
  [SupportedChainId.CUJO]:      'http://graph.playgrounds.academy/subgraphs/name/beanstalk',
};
