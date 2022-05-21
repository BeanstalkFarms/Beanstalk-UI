import ethLogoUrl from 'img/eth-logo.svg';
import beanLogoUrl from 'img/bean-logo.svg';
import beanEthLogoUrl from 'img/bean-eth-logo.svg';
// import usdcLogoUrl from 'img/usdc-logo.svg';
// import daiLogoUrl from 'img/dai-logo.svg';
// import usdtLogoUrl from 'img/usdt-logo.svg';
// import crv3LogoUrl from 'img/crv3-logo.svg';

import { ERC20Token, NativeToken, BeanstalkToken } from 'classes/Token';
import { SupportedChainId } from '../chains';

export const ETH = {
  [SupportedChainId.MAINNET]: new NativeToken(
    '',
    SupportedChainId.MAINNET,
    18,
    'Ether',
    'ETH',
    ethLogoUrl
  ),
}

export const Weth = new ERC20Token(
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  SupportedChainId.MAINNET,
  18,
  'Wrapped Ether',
  'WETH',
  ethLogoUrl
);

export const Stalk = new BeanstalkToken(
  '',
  SupportedChainId.MAINNET,
  10,
  'Stalk',
  'STALK',
  '',
  'stalk'
)

export const Seeds = new BeanstalkToken(
  '',
  SupportedChainId.MAINNET,
  10,
  'Seeds',
  'SEED',
  '',
  'seeds'
)

const BEAN = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db',
    SupportedChainId.MAINNET,
    6,
    'Bean',
    'BEAN',
    beanLogoUrl,
    'bean', // FIXME: use slug or address in url?
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db',
    SupportedChainId.MAINNET,
    6,
    'Bean',
    'BEAN',
    beanLogoUrl,
    'bean', // FIXME: use slug or address in url?
  ),
}

export const Bean = BEAN[SupportedChainId.MAINNET];

export const BeanEthUniswapLP = new ERC20Token(
  '0x87898263B6C5BABe34b4ec53F22d98430b91e371',
  SupportedChainId.MAINNET,
  18,
  'BEAN:ETH Uniswap V2 LP',
  'BEAN:ETH',
  beanEthLogoUrl,
  'bean-eth',
);

// --

export const SiloTokensByAddress = {
  [Bean.address.toLowerCase()]: Bean,
  [BeanEthUniswapLP.address.toLowerCase()]: BeanEthUniswapLP,
};

export const SiloTokens = Object.values(SiloTokensByAddress);
