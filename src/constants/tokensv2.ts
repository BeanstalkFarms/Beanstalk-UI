import { Token } from 'classes';
// Beanstalk
// address: string, chainId: number, decimals: number, symbol?: string, name?: string, logo?: string
import BeanLogo from 'img/bean-logo.svg';
import EthereumLogo from 'img/eth-logo.svg';
import USDCLogo from 'img/usdc-logo.svg';
import DAILogo from 'img/dai-logo.svg';
import USDTLogo from 'img/usdt-logo.svg';
import CRVLogo from 'img/crv3-logo.svg';

export const Bean = new Token(
  '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db',
  1,
  6,
  'Bean',
  'BEAN',
  BeanLogo
);

export const Eth = new Token(
  '',
  1,
  18,
  'Ether',
  'ETH',
  EthereumLogo
);

export const Weth = new Token(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  1,
  18,
  'Wrapped Ether',
  'WETH',
  EthereumLogo
);

// Supported Stables

export const Usdc = new Token(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  1,
  6,
  'USDC',
  'USDC',
  USDCLogo
);

export const Dai = new Token(
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  1,
  18,
  'Dai',
  'DAI',
  DAILogo
);

export const Tether = new Token(
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  1,
  6,
  'Tether',
  'USDT',
  USDTLogo
);

export const Crv3 = new Token(
  '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
  1,
  18,
  '3 Curve',
  '3CRV',
  CRVLogo
);

export const supportedTokens = [Eth, Weth, Bean, Weth, Usdc, Dai, Tether, Crv3];
export const supportedERC20Tokens = [Weth, Bean, Weth, Usdc, Dai, Tether, Crv3];
