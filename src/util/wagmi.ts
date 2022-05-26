import { ethers } from 'ethers';
import { createWagmiClient } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { SupportedChainId } from 'constants/chains';
import { ALCHEMY_API_KEYS } from 'constants/rpc/alchemy';

const client = createWagmiClient({
  provider: (config) => (
    new ethers.providers.AlchemyProvider(
      config.chainId,
      ALCHEMY_API_KEYS[(config.chainId as SupportedChainId) || SupportedChainId.MAINNET]
    )
  ),
  // webSocketProvider: (config) => (
  //   new ethers.providers.AlchemyWebSocketProvider(
  //     config.chainId,
  //     ALCHEMY_API_KEYS[(config.chainId as SupportedChainId) || SupportedChainId.MAINNET]
  //   )
  // ),
  autoConnect: true,
  connectors: [
    new InjectedConnector(),
    new WalletConnectConnector({
      options: {
        qrcode: true,
      },
    }),
  ]
});

export default client;
