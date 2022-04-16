import { Token } from 'classes';

// Beanstalk
// address: string, chainId: number, decimals: number, symbol?: string, name?: string, logo?: string
import beanLogoUrl from 'img/bean-logo.svg';
import beanEthLogoUrl from 'img/bean-eth-logo.svg';
import ethLogoUrl from 'img/eth-logo.svg';
import usdcLogoUrl from 'img/usdc-logo.svg';
import daiLogoUrl from 'img/dai-logo.svg';
import usdtLogoUrl from 'img/usdt-logo.svg';
import crv3LogoUrl from 'img/crv3-logo.svg';
import { SupportedChainId } from './chains';

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
)










// ========================

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


// -- Supported Stables

export const Usdc = new Token(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  SupportedChainId.MAINNET,
  6,
  'USDC',
  'USDC',
  usdcLogoUrl
);

export const Dai = new Token(
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  SupportedChainId.MAINNET,
  18,
  'Dai',
  'DAI',
  daiLogoUrl
);

export const Tether = new Token(
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  SupportedChainId.MAINNET,
  6,
  'Tether',
  'USDT',
  usdtLogoUrl
);

export const Crv3 = new Token(
  '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  SupportedChainId.MAINNET,
  18,
  '3 Curve',
  '3CRV',
  crv3LogoUrl
);

export const supportedTokensV2 = [Eth, Weth, Bean, Usdc, Dai, Tether, Crv3];
export const supportedERC20TokensV2 = [Weth, Bean, Usdc, Dai, Tether, Crv3];
