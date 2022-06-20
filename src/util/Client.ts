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

export const TESTNET_RPC_ADDRESSES : { [chainId: number] : string } = {
  [SupportedChainId.LOCALHOST]: 'http://localhost:8545',
  [SupportedChainId.HARDHAT]:   'http://bean-rpc.treetree.finance/',
}

const baseChains = [
  chain.mainnet,
  chain.ropsten,
];

if (Boolean(process.env.REACT_APP_SHOW_DEV_CHAINS) === true) {
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
