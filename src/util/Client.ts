import { createClient as createWagmiClient, configureChains, chain } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
// import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

import { SupportedChainId } from 'constants/chains';
import { ALCHEMY_API_KEYS } from 'constants/rpc/alchemy';

const alchemyId = ALCHEMY_API_KEYS[SupportedChainId.MAINNET];

const baseChains = [
  chain.mainnet,
  chain.ropsten,
];

if (Boolean(process.env.REACT_APP_DISABLE_NETWORK_LOCALHOST) === false) {
  baseChains.push(chain.localhost);
  baseChains.push(chain.hardhat);
}

const { chains, provider } = configureChains(
  baseChains, 
  [
    alchemyProvider({
      alchemyId,
      priority: 0,
    }),
    jsonRpcProvider({
      priority: 1,
      rpc: (_chain) => {
        if (_chain.id === SupportedChainId.HARDHAT) {
          return { http: 'http://bean-rpc.treetree.finance/' };
        }
        if (_chain.id === SupportedChainId.LOCALHOST) {
          return { http: 'http://localhost:8545' };
        }
        return null;
      }
    }),
    publicProvider({
      priority: 2,
    }),
  ]
);

const client = createWagmiClient({
  autoConnect: true,
  provider,
  connectors: [
    new MetaMaskConnector({
      chains
    }),
    // new InjectedConnector({
    //   chains,
    //   options: {
    //     name: 'Injected',
    //     shimDisconnect: true,
    //   }
    // }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'Beanstalk',
      }
    }),
  ]
});

export default client;