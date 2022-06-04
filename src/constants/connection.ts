import metamaskIcon from 'img/wallets/metamask-icon.png';
import walletConnectIcon from 'img/wallets/walletconnect-icon.svg';
import coinbaseWalletIcon from 'img/wallets/coinbase-wallet-icon.png';
import { Connector } from 'wagmi';
import { SupportedChainId } from './chains';

export const CONNECTOR_LOGOS : { [key: string] : string } = {
  MetaMask: metamaskIcon,
  WalletConnect: walletConnectIcon,
  'Coinbase Wallet': coinbaseWalletIcon,
};

export const CONNECTION_ERRORS_TO_MESSAGES : { 
  [key: string] : (c?: Connector) => string } = {
  UserRejectedRequestError: () => 'The connection was cancelled while in progress. Try connecting again.',
  'Already processing eth_requestAccounts. Please wait.': (c) => `Connection already in progress. Try unlocking ${c?.name || 'your wallet'} to allow Beanstalk to connect.`,
};

export const NETWORK_ERRORS_TO_MESSAGES : { 
  [key: string] : (c?: SupportedChainId) => string } = {
  UserRejectedRequestError: () => 'The switch was cancelled while in progress. Try switching again.',
};
