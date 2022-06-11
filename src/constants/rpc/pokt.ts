import { SupportedChainId } from '../chains';

/**
 */
export const POKT_HTTPS_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: 'https://eth-archival.gateway.pokt.network/v1/lb/624c6789c9186a003b6bb8e7',
  [SupportedChainId.ROPSTEN]: 'https://eth-ropsten.gateway.pokt.network/v1/lb/624de453a846f20039ba3b7b',
  [SupportedChainId.LOCALHOST]: '',
};
