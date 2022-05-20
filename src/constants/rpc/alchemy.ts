import { SupportedChainId } from '../chains';

/**
 * Below Alchemy keys owned by eng@bean.farm.
 */
export const ALCHEMY_API_KEYS : { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: 'iByabvqm_66b_Bkl9M-wJJGdCTuy19R3',
  [SupportedChainId.ROPSTEN]: 'ds4ljBC_Pq-PaIQ3aHo04t27y2n8qpry',
};
export const ALCHEMY_HTTPS_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: 'https://eth-mainnet.alchemyapi.io/v2/iByabvqm_66b_Bkl9M-wJJGdCTuy19R3',
  [SupportedChainId.ROPSTEN]: 'https://eth-ropsten.alchemyapi.io/v2/ds4ljBC_Pq-PaIQ3aHo04t27y2n8qpry',
  [SupportedChainId.LOCALHOST]: 'http://127.0.0.1:8545',
};
export const ALCHEMY_WS_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: 'wss://eth-mainnet.alchemyapi.io/v2/iByabvqm_66b_Bkl9M-wJJGdCTuy19R3',
  [SupportedChainId.ROPSTEN]: 'wss://eth-ropsten.alchemyapi.io/v2/ds4ljBC_Pq-PaIQ3aHo04t27y2n8qpry',
  [SupportedChainId.LOCALHOST]: 'wss://127.0.0.1:8545',
};
