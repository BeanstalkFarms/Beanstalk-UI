import ethLogoUrl from 'img/eth-logo.svg';
import beanLogoUrl from 'img/bean-logo.svg';
import beanEthLogoUrl from 'img/bean-eth-logo.svg';
import stalkLogo from 'img/stalk-logo.svg';
import seedLogo from 'img/seed-logo.svg';
// import usdcLogoUrl from 'img/usdc-logo.svg';
// import daiLogoUrl from 'img/dai-logo.svg';
// import usdtLogoUrl from 'img/usdt-logo.svg';
// import crv3LogoUrl from 'img/crv3-logo.svg';

import Token, { ERC20Token, NativeToken, BeanstalkToken } from 'classes/Token';
import { SupportedChainId } from '../chains';

// Native Tokens

export const ETH = {
  [SupportedChainId.MAINNET]: new NativeToken(
    '',
    SupportedChainId.MAINNET,
    18,
    {
      name: 'Ether',
      symbol: 'ETH',
      logo: ethLogoUrl
    }
  ),
}

// Beanstalk Internal Tokens (not ERC20)

export const Stalk = new BeanstalkToken(
  '',
  SupportedChainId.MAINNET,
  10,
  {
    name: 'Stalk',
    symbol: 'STALK',
    logo: stalkLogo,
  }
)

export const Seeds = new BeanstalkToken(
  '',
  SupportedChainId.MAINNET,
  10,
  {
    name: 'Seeds',
    symbol: 'SEED',
    logo: seedLogo,
  }
)

// ERC20 Tokens

export const WETH = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    SupportedChainId.MAINNET,
    18,
    {
      name: 'Wrapped Ether',
      symbol: 'WETH',
      logo: ethLogoUrl
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    SupportedChainId.ROPSTEN,
    18,
    {
      name: 'Wrapped Ether',
      symbol: 'WETH',
      logo: ethLogoUrl
    }
  )
};

export const BEAN = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db',
    SupportedChainId.MAINNET,
    6,
    {
      name: 'Bean',
      symbol: 'BEAN',
      logo: beanLogoUrl,
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db',
    SupportedChainId.ROPSTEN,
    6,
    {
      name: 'Bean',
      symbol: 'BEAN',
      logo: beanLogoUrl,
    }
  ),
}

export const BEAN_ETH_UNISWAP_V2_LP = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371',
    SupportedChainId.MAINNET,
    18,
    {
      name: 'BEAN:ETH Uniswap V2 LP',
      symbol: 'BEAN:ETH',
      logo: beanEthLogoUrl,
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    '0x298c5f1f902c5bDc2936eb44b3E0E8675F40B8db',
    SupportedChainId.ROPSTEN,
    18,
    {
      name: 'BEAN:ETH Uniswap V2 LP',
      symbol: 'BEAN:ETH',
      logo: beanEthLogoUrl,
    }
  ),
}

// --

// export const SiloTokensByAddress = {
//   [Bean.address.toLowerCase()]: Bean,
//   [BeanEthUniswapLP.address.toLowerCase()]: BeanEthUniswapLP,
// };

// export const SiloTokens = Object.values(SiloTokensByAddress);

export const whitelist : { [address: string] : Token }[] = [
  BEAN,
  BEAN_ETH_UNISWAP_V2_LP,
]