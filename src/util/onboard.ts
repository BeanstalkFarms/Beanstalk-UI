import type { EIP1193Provider, ChainListener } from '@web3-onboard/common';
import Onboard, { OnboardAPI } from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import { InjectedNameSpace, InjectedWalletModule } from '@web3-onboard/injected-wallets/dist/types';
import { createEIP1193Provider } from '@web3-onboard/common';
import ledgerModule from '@web3-onboard/ledger';
import trezorModule from '@web3-onboard/trezor';
import walletConnectModule from '@web3-onboard/walletconnect';
import walletLinkModule from '@web3-onboard/walletlink';
import { CHAIN_INFO, SupportedChainId } from 'constants/chains';
import { INFURA_NETWORK_URLS } from 'constants/infura';

import tallyIconUrl from 'img/tally-icon.svg';

const getChainInfo = (_chainId: SupportedChainId) => ({
  token: CHAIN_INFO[_chainId].nativeCurrency.symbol,
  label: CHAIN_INFO[_chainId].label,
  rpcUrl: INFURA_NETWORK_URLS[_chainId],
});

//
let onboard : OnboardAPI | undefined;
if (!onboard) {
  const tally: InjectedWalletModule = {
    label: 'Tally',
    injectedNamespace: InjectedNameSpace.Ethereum,
    checkProviderIdentity: ({ provider }) =>
      !!provider && !!provider.isTally,
    // The `_: any` fixes a validation error returned by @web3-onboard/core 
    // if getIcon and getInterface have arity = 0.
    // @ts-ignore
    getIcon: async (_: any) => tallyIconUrl,
    getInterface: async (_: any) => {
      const provider = createEIP1193Provider(
        // @ts-ignore
        window.ethereum,
        {
          eth_chainId: ({ baseRequest }) => (
            baseRequest({ method: 'eth_chainId' }).then(
              (id: string) => `0x${parseInt(id, 10).toString(16)}`
            )
          ),
          wallet_switchEthereumChain: null,
        }
      );
      return { provider };
    },
    platforms: ['all']
  };

  onboard = Onboard({
    wallets: [
      injectedModule({
        custom: [
          tally
        ]
      }),
      walletConnectModule({
        qrcodeModalOptions: {
          mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar']
        }
      }),
      walletLinkModule({ darkMode: true }),
      ledgerModule(),
      trezorModule({
        email: 'operations@bean.money',
        appUrl: 'https://app.bean.money'
      })
    ],
    chains: [
      {
        id: '0x1',
        ...getChainInfo(SupportedChainId.MAINNET)
      },
      {
        id: '0x3',
        ...getChainInfo(SupportedChainId.ROPSTEN)
      },
    ],
    appMetadata: {
      name: 'Beanstalk',
      icon: 'https://app.bean.money/assets/beanstalk-logo-square.png',
      description: 'Beanstalk is a decentralized credit based stablecoin protocol.',
      recommendedInjectedWallets: [
        { name: 'MetaMask', url: 'https://metamask.io' },
        { name: 'Tally', url: 'https://tally.cash' },
        { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      ]
    }
  });
}

export default onboard;
