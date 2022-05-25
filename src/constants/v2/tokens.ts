import ethLogoUrl from 'img/eth-logo.svg';
import beanLogoUrl from 'img/bean-logo.svg';
import beanEthLogoUrl from 'img/bean-eth-logo.svg';
import beanCrv3LogoUrl from 'img/bean-crv3-logo.svg';
import crv3 from 'img/crv3-logo.svg';
import stalkLogo from 'img/stalk-logo.svg';
import seedLogo from 'img/seed-logo.svg';
// import usdcLogoUrl from 'img/usdc-logo.svg';
// import daiLogoUrl from 'img/dai-logo.svg';
// import usdtLogoUrl from 'img/usdt-logo.svg';
// import crv3LogoUrl from 'img/crv3-logo.svg';

import Token, { ERC20Token, NativeToken, BeanstalkToken } from 'classes/Token';
import { SupportedChainId } from '../chains';
import { ChainConstant } from '.';
import { BEAN_CRV3_ADDRESSES, CRV3_ADDRESSES } from './addresses';

export type TokenMap<T = Token> = ChainConstant<T>;
export type TokenOrTokenMap<T = Token> = T | TokenMap<T>;
export type TokensByAddress<T = Token> = { [address: string] : T };

// -- Native Tokens

export const ETH = {
  [SupportedChainId.MAINNET]: new NativeToken(
    SupportedChainId.MAINNET,
    '',
    18,
    {
      name: 'Ether',
      symbol: 'ETH',
      logo: ethLogoUrl
    }
  ),
  [SupportedChainId.ROPSTEN]: new NativeToken(
    SupportedChainId.ROPSTEN,
    '',
    18,
    {
      name: 'Ropsten Ether',
      symbol: 'ropETH',
      logo: ethLogoUrl
    }
  ),
};

// -- Beanstalk Internal Tokens (not ERC20)

export const STALK = new BeanstalkToken(
  SupportedChainId.MAINNET,
  '',
  10,
  {
    name: 'Stalk',
    symbol: 'STALK',
    logo: stalkLogo,
  }
);

export const SEEDS = new BeanstalkToken(
  SupportedChainId.MAINNET,
  '',
  10,
  {
    name: 'Seeds',
    symbol: 'SEED',
    logo: seedLogo,
  }
);

// -- ERC20 Tokens

export const WETH = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    {
      name: 'Wrapped Ether',
      symbol: 'WETH',
      logo: ethLogoUrl
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    '0xc778417E063141139Fce010982780140Aa0cD5Ab',
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
    SupportedChainId.MAINNET,
    '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db',
    6,
    {
      name: 'Bean',
      symbol: 'BEAN',
      logo: beanLogoUrl,
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    '0xDC59ac4FeFa32293A95889Dc396682858d52e5Db',
    6,
    {
      name: 'Bean',
      symbol: 'BEAN',
      logo: beanLogoUrl,
    }
  ),
};

export const BEAN_ETH_UNIV2_LP : ChainConstant<ERC20Token> = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371',
    18,
    {
      name: 'BEAN:ETH Uniswap V2 LP',
      symbol: 'BEAN:ETH',
      logo: beanEthLogoUrl,
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    '0x298c5f1f902c5bDc2936eb44b3E0E8675F40B8db',
    18,
    {
      name: 'BEAN:ETH Uniswap V2 LP',
      symbol: 'BEAN:ETH',
      logo: beanEthLogoUrl,
    }
  ),
};

export const CRV3 = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    CRV3_ADDRESSES,
    18,
    {
      name: '3CRV',
      symbol: '3CRV',
      logo: beanCrv3LogoUrl,
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    CRV3_ADDRESSES,
    18,
    {
      name: '3CRV',
      symbol: '3CRV',
      logo: beanCrv3LogoUrl,
    }
  ),
};

export const BEAN_CRV3_LP = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    BEAN_CRV3_ADDRESSES,
    18,
    {
      name: 'BEAN:3CRV LP',
      symbol: 'BEAN:3CRV',
      logo: beanCrv3LogoUrl,
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    BEAN_CRV3_ADDRESSES,
    18,
    {
      name: 'BEAN:3CRV LP',
      symbol: 'BEAN:3CRV',
      logo: beanCrv3LogoUrl,
    }
  ),
};

// -- Token Lists

export const ERC20Tokens : TokenMap[] = [
  BEAN,
  BEAN_ETH_UNIV2_LP,
  WETH,
];

export const SiloWhitelistTokens : TokenMap[] = [
  BEAN,
  BEAN_ETH_UNIV2_LP,
];
