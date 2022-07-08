import { createClient as createWagmiClient, configureChains, chain, Chain } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
// import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

import { SupportedChainId, TESTNET_RPC_ADDRESSES } from 'constants/chains';

// ------------------------------------------------------------

// Setup node
// FIXME: overlaps heavily with Uniswap fork implementation
const makeTestnet = (_chainId: number, name: string) : Chain => ({
  id: _chainId,
  name: name,
  network: 'ethereum',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: TESTNET_RPC_ADDRESSES[_chainId],
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
  testnet: true,
});

const baseChains = [
  chain.mainnet,
  chain.ropsten,
];

if (Boolean(process.env.REACT_APP_SHOW_DEV_CHAINS) === true) {
  baseChains.push(makeTestnet(SupportedChainId.ASTRO, 'Astro'));
  baseChains.push(makeTestnet(SupportedChainId.PHOENIX, 'Phoenix'));
  baseChains.push(makeTestnet(SupportedChainId.CUJO, 'Cujo'));
  baseChains.push(chain.localhost);
}

const { chains, provider } = configureChains(
  baseChains, 
  [
    alchemyProvider({
      alchemyId: process.env.REACT_APP_ALCHEMY_API_KEY,
      priority: 0,
    }),
    jsonRpcProvider({
      priority: 1,
      rpc: (_chain) => {
        if (!TESTNET_RPC_ADDRESSES[_chain.id]) return null;
        return { http: TESTNET_RPC_ADDRESSES[_chain.id] };
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
