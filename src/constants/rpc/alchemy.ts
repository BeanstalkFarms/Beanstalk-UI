import { SupportedChainId } from '../chains';

/**
 */
export const ALCHEMY_HTTPS_URLS: { [key in SupportedChainId]: string } = {
  // Publius
  [SupportedChainId.MAINNET]: 'https://mainnet.infura.io/v3/9d1f966887eb483696b887c83bce72e8',
  [SupportedChainId.ROPSTEN]: 'https://eth-ropsten.alchemyapi.io/v2/0PP-QsBHdEmB5X2ICrdumWCxvJnOmqMf',
  // Silo Chad
  // [SupportedChainId.MAINNET]: 'https://eth-mainnet.alchemyapi.io/v2/iByabvqm_66b_Bkl9M-wJJGdCTuy19R3',
  // [SupportedChainId.ROPSTEN]: 'https://eth-ropsten.alchemyapi.io/v2/ds4ljBC_Pq-PaIQ3aHo04t27y2n8qpry',
  [SupportedChainId.LOCALHOST]: 'http://127.0.0.1:8545',
};
export const ALCHEMY_WS_URLS: { [key in SupportedChainId]: string } = {
  // Publius
  [SupportedChainId.MAINNET]: 'wss://mainnet.infura.io/ws/v3/9d1f966887eb483696b887c83bce72e8',
  [SupportedChainId.ROPSTEN]: 'wss://eth-ropsten.alchemyapi.io/v2/0PP-QsBHdEmB5X2ICrdumWCxvJnOmqMf',
  // Silo Chad
  // [SupportedChainId.MAINNET]: 'wss://eth-mainnet.alchemyapi.io/v2/iByabvqm_66b_Bkl9M-wJJGdCTuy19R3',
  // [SupportedChainId.ROPSTEN]: 'wss://eth-ropsten.alchemyapi.io/v2/ds4ljBC_Pq-PaIQ3aHo04t27y2n8qpry',
  [SupportedChainId.LOCALHOST]: 'wss://127.0.0.1:8545',
};
