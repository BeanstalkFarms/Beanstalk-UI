import { Token } from 'classes';

import ethLogoUrl from 'img/eth-logo.svg';
import beanLogoUrl from 'img/bean-logo.svg';
import beanEthLogoUrl from 'img/bean-eth-logo.svg';
// import usdcLogoUrl from 'img/usdc-logo.svg';
// import daiLogoUrl from 'img/dai-logo.svg';
// import usdtLogoUrl from 'img/usdt-logo.svg';
// import crv3LogoUrl from 'img/crv3-logo.svg';

import { SupportedChainId } from '../chains';

export const Eth = new Token(
  '',
  SupportedChainId.MAINNET,
  18,
  'Ether',
  'ETH',
  ethLogoUrl
);

export const Weth = new Token(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  SupportedChainId.MAINNET,
  18,
  'Wrapped Ether',
  'WETH',
  ethLogoUrl
);

export const Bean = new Token(
  '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db',
  SupportedChainId.MAINNET,
  6,
  'Bean',
  'BEAN',
  beanLogoUrl
);

export const BeanEthUniswapLP = new Token(
  '0x87898263B6C5BABe34b4ec53F22d98430b91e371',
  SupportedChainId.MAINNET,
  18,
  'BEAN:ETH Uniswap V2 LP',
  'BEAH:ETH',
  beanEthLogoUrl,
);
