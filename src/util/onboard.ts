
import Onboard, { OnboardAPI } from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import { CHAIN_INFO, SupportedChainId } from 'constants/chains';
import { INFURA_NETWORK_URLS } from 'constants/infura';

const getChainInfo = (_chainId: SupportedChainId) => ({
  token: CHAIN_INFO[_chainId].nativeCurrency.symbol,
  label: CHAIN_INFO[_chainId].label,
  rpcUrl: INFURA_NETWORK_URLS[_chainId],
});

let onboard : OnboardAPI | undefined;
if(!onboard) {
  onboard = Onboard({
    wallets: [
      injectedModule(),
      walletConnectModule({
        qrcodeModalOptions: {
          mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar']
        }
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
      description: 'Beanstalk is a decentralized credit based stablecoin protocol.'
    }
  });
}

export default onboard;