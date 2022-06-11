import { SupportedChainId } from '../chains';

const INFURA_KEY = '23db69ab62394f4eb41db6a21853402c'; // Silo Chad's key
if (typeof INFURA_KEY === 'undefined') {
  throw new Error('INFURA_KEY must be defined');
}

/**
 * These are the network URLs used by the interface when there is not another available source of chain data
 */
export const INFURA_HTTPS_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.LOCALHOST]: '',
};
export const INFURA_WS_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: `wss://mainnet.infura.io/ws/v3/${INFURA_KEY}`,
  [SupportedChainId.ROPSTEN]: `wss://ropsten.infura.io/ws/v3/${INFURA_KEY}`,
  [SupportedChainId.LOCALHOST]: '',
};
