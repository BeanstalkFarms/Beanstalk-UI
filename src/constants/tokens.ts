// Ethereum Images
import ethIconCircledUrl from 'img/tokens/eth-logo-circled.svg';
import wEthIconCircledUrl from 'img/tokens/weth-logo-circled.svg';
import ropEthIconCircledUrl from 'img/tokens/ropeth-logo-circled.svg';

// Bean Images
// import beanLogoUrl from 'img/tokens/bean-logo.svg';
import beanCircleLogoUrl from 'img/tokens/bean-logo-circled.svg';
import beanEthLpLogoUrl from 'img/tokens/bean-eth-lp-logo.svg';
import beanCrv3LpLogoUrl from 'img/tokens/bean-crv3-logo.svg';
import beanLusdLogoUrl from 'img/tokens/bean-lusd-logo.svg';

// Beanstalk Token Logos
import stalkLogo from 'img/beanstalk/stalk-icon.svg';
import seedLogo from 'img/beanstalk/seed-icon.svg';
import podsLogo from 'img/beanstalk/pod-icon.svg';
import sproutLogo from 'img/beanstalk/sprout-icon.svg';
import rinsableSproutLogo from 'img/beanstalk/rinsable-sprout-icon.svg';

// ERC-20 Token Images
import crv3LogoUrl from 'img/tokens/crv3-logo.svg';
import daiLogoUrl from 'img/tokens/dai-logo.svg';
import usdcLogoUrl from 'img/tokens/usdc-logo.svg';
import usdtLogoUrl from 'img/tokens/usdt-logo.svg';
import lusdLogoUrl from 'img/tokens/lusd-logo.svg';
import unripeBeanLogoUrl from 'img/tokens/unripe-bean-logo-circled.svg';
import unripeBeanCrv3LogoUrl from 'img/tokens/unripe-lp-logo-circled.svg';

// Other imports
import { ERC20Token, NativeToken, BeanstalkToken } from 'classes/Token';
import { SupportedChainId } from './chains';
import { ChainConstant } from '.';
import { BEAN_CRV3_ADDRESSES, BEAN_LUSD_ADDRESSES, CRV3_ADDRESSES, DAI_ADDRESSES, LUSD_ADDRESSES, USDC_ADDRESSES, USDT_ADDRESSES, UNRIPE_BEAN_ADDRESSES, UNRIPE_BEAN_CRV3_ADDRESSES, BEAN_ADDRESSES } from './addresses';

// ----------------------------------------
// Types + Utilities
// ----------------------------------------

// const multiChain = (
//   addressByChainId: ChainConstant<string>,
//   token:  BaseClassConstructor<Token>,
//   params: ConstructorParameters<typeof Token>,
// ) => {
//   const result : { [key: number]: Token }= {};
//   return Object.keys(addressByChainId).reduce<{ [key: number]: Token }>((prev, chainId) => {
//     prev[curr as number] = addressByChainId[curr]
//     return prev;
//   }, {});
// }

// ----------------------------------------
// Native Tokens
// ----------------------------------------

export const ETH_DECIMALS = 18;
export const ETH = {
  [SupportedChainId.MAINNET]: new NativeToken(
    SupportedChainId.MAINNET,
    'ETH',
    ETH_DECIMALS,
    {
      name: 'Ether',
      symbol: 'ETH',
      logo: ethIconCircledUrl
    }
  ),
  [SupportedChainId.ROPSTEN]: new NativeToken(
    SupportedChainId.ROPSTEN,
    'ETH',
    ETH_DECIMALS,
    {
      name: 'Ropsten Ether',
      symbol: 'ropETH',
      logo: ropEthIconCircledUrl
    }
  ),
};

// ----------------------------------------
// Beanstalk Internal Tokens (not ERC20)
// ----------------------------------------

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
  6,
  {
    name: 'Seeds',
    symbol: 'SEED',
    logo: seedLogo,
  }
);

export const PODS = new BeanstalkToken(
  SupportedChainId.MAINNET,
  '',
  6,
  {
    name: 'Pods',
    symbol: 'PODS',
    logo: podsLogo,
  }
);

export const SPROUTS = new BeanstalkToken(
  SupportedChainId.MAINNET,
  '',
  6,
  {
    name: 'Sprouts',
    symbol: 'SPROUT',
    logo: sproutLogo,
  }
);

export const RINSABLE_SPROUTS = new BeanstalkToken(
  SupportedChainId.MAINNET,
  '',
  6,
  {
    name: 'Rinsable Sprouts',
    symbol: 'rSPROUT',
    logo: rinsableSproutLogo,
  }
);

// ----------------------------------------
// ERC20 Tokens
// ----------------------------------------

export const WETH = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    {
      name: 'Wrapped Ether',
      symbol: 'WETH',
      logo: wEthIconCircledUrl
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    18,
    {
      name: 'Wrapped Ether',
      symbol: 'WETH',
      logo: wEthIconCircledUrl
    }
  )
};

export const BEAN = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    BEAN_ADDRESSES,
    6,
    {
      name: 'Bean',
      symbol: 'BEAN',
      logo: beanCircleLogoUrl,
    },
    {
      stalk: 1,
      seeds: 2,
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    BEAN_ADDRESSES,
    6,
    {
      name: 'Bean',
      symbol: 'BEAN',
      logo: beanCircleLogoUrl,
    },
    {
      stalk: 1,
      seeds: 2,
    }
  ),
  // ------[Post-Replant]------
  [SupportedChainId.PHOENIX]: new ERC20Token(
    SupportedChainId.PHOENIX,
    BEAN_ADDRESSES,
    6,
    {
      name: 'Bean',
      symbol: 'BEAN',
      logo: beanCircleLogoUrl,
    },
    {
      stalk: 1,
      seeds: 2,
    }
  ),
  [SupportedChainId.LOCALHOST]: new ERC20Token(
    SupportedChainId.LOCALHOST,
    BEAN_ADDRESSES,
    6,
    {
      name: 'Bean',
      symbol: 'BEAN',
      logo: beanCircleLogoUrl,
    },
    {
      stalk: 1,
      seeds: 2,
    }
  ),
  [SupportedChainId.CUJO]: new ERC20Token(
    SupportedChainId.CUJO,
    BEAN_ADDRESSES,
    6,
    {
      name: 'Bean',
      symbol: 'BEAN',
      logo: beanCircleLogoUrl,
    },
    {
      stalk: 1,
      seeds: 2,
    }
  ),
};

// CRV3 + Underlying Stables
const crv3Meta = {
  name: '3CRV',
  symbol: '3CRV',
  logo: crv3LogoUrl,
  isLP: true,
};
export const CRV3 = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    CRV3_ADDRESSES,
    18,
    crv3Meta,
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    CRV3_ADDRESSES,
    18,
    crv3Meta,
  ),
};

export const DAI = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    DAI_ADDRESSES,
    18,
    {
      name: 'Dai',
      symbol: 'DAI',
      logo: daiLogoUrl,
    }
  ),
};

const usdcMeta = {
  name: 'USD Coin',
  symbol: 'USDC',
  logo: usdcLogoUrl,
};
export const USDC = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    USDC_ADDRESSES,
    6,
    usdcMeta,
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    USDC_ADDRESSES,
    6,
    usdcMeta,
  ),
};

export const USDT = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    USDT_ADDRESSES,
    6,
    {
      name: 'Tether',
      symbol: 'USDT',
      logo: usdtLogoUrl,
    }
  ),
};

// Other
const lusdMeta = {
  name: 'LUSD',
  symbol: 'LUSD',
  logo: lusdLogoUrl,
};
export const LUSD = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    LUSD_ADDRESSES,
    18,
    lusdMeta,
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    LUSD_ADDRESSES,
    18,
    lusdMeta,
  ),
};

// ----------------------------------------
// ERC20 Tokens - LP
// ----------------------------------------

const beanEthLpMeta = {
  name: 'BEAN:ETH LP',
  symbol: 'BEAN:ETH',
  logo: beanEthLpLogoUrl,
  displayDecimals: 9,
  isLP: true,
};
export const BEAN_ETH_UNIV2_LP = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    '0x87898263B6C5BABe34b4ec53F22d98430b91e371',
    18,
    beanEthLpMeta,
    {
      stalk: 1,
      seeds: 4,
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    '0x298c5f1f902c5bDc2936eb44b3E0E8675F40B8db',
    18,
    beanEthLpMeta,
    {
      stalk: 1,
      seeds: 4,
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
      logo: beanCrv3LpLogoUrl,
      isLP: true,
    },
    {
      stalk: 1,
      seeds: 4,
    }
  ),
  [SupportedChainId.ROPSTEN]: new ERC20Token(
    SupportedChainId.ROPSTEN,
    BEAN_CRV3_ADDRESSES,
    18,
    {
      name: 'BEAN:3CRV LP',
      symbol: 'BEAN:3CRV',
      logo: beanCrv3LpLogoUrl,
      isLP: true,
    },
    {
      stalk: 1,
      seeds: 4,
    }
  ),
  // ------[Post-Replant]------
  [SupportedChainId.PHOENIX]: new ERC20Token(
    SupportedChainId.PHOENIX,
    BEAN_CRV3_ADDRESSES,
    18,
    {
      name: 'BEAN:3CRV LP',
      symbol: 'BEAN:3CRV',
      logo: beanCrv3LpLogoUrl,
      isLP: true,
    },
    {
      stalk: 1,
      seeds: 4,
    }
  ),
  [SupportedChainId.LOCALHOST]: new ERC20Token(
    SupportedChainId.LOCALHOST,
    BEAN_CRV3_ADDRESSES,
    18,
    {
      name: 'BEAN:3CRV LP',
      symbol: 'BEAN:3CRV',
      logo: beanCrv3LpLogoUrl,
      isLP: true,
    },
    {
      stalk: 1,
      seeds: 4,
    }
  ),
  [SupportedChainId.CUJO]: new ERC20Token(
    SupportedChainId.CUJO,
    BEAN_CRV3_ADDRESSES,
    18,
    {
      name: 'BEAN:3CRV LP',
      symbol: 'BEAN:3CRV',
      logo: beanCrv3LpLogoUrl,
      isLP: true,
    },
    {
      stalk: 1,
      seeds: 4,
    }
  ),
};

export const BEAN_LUSD_LP = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    BEAN_LUSD_ADDRESSES,
    18,
    {
      name: 'BEAN:LUSD LP',
      symbol: 'BEAN:LUSD',
      logo: beanLusdLogoUrl,
      isLP: true,
    },
    {
      stalk: 1,
      seeds: 3,
    }
  ),
};

// ----------------------------------------
// ERC20 Tokens - Unripe
// ----------------------------------------

export const UNRIPE_BEAN = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    UNRIPE_BEAN_ADDRESSES,
    6,
    {
      name: 'Unripe Bean',
      symbol: 'urBEAN',
      logo: unripeBeanLogoUrl,
      displayDecimals: 2,
    },
    {
      stalk: 1,
      seeds: 2,
    }
  ),
};

export const UNRIPE_BEAN_CRV3 = {
  [SupportedChainId.MAINNET]: new ERC20Token(
    SupportedChainId.MAINNET,
    UNRIPE_BEAN_CRV3_ADDRESSES,
    6,
    {
      name: 'Unripe BEAN:3CRV LP',
      symbol: 'urBEAN3CRV',
      logo: unripeBeanCrv3LogoUrl,
      displayDecimals: 2,
    },
    {
      stalk: 1,
      seeds: 4,
    }
  ),
};

// ----------------------------------------
// Token Lists
// ----------------------------------------

export const UNRIPE_TOKENS: ChainConstant<ERC20Token>[] = [
  UNRIPE_BEAN,
  UNRIPE_BEAN_CRV3,
];

// Show these tokens as whitelisted in the Silo.
export const SILO_WHITELIST: ChainConstant<ERC20Token>[] = [
  BEAN,
  BEAN_CRV3_LP,
  UNRIPE_BEAN,
  UNRIPE_BEAN_CRV3
  // Legacy LP tokens
  // BEAN_ETH_UNIV2_LP,
  // BEAN_LUSD_LP,
];

// All supported ERC20 tokens.
export const ERC20_TOKENS: ChainConstant<ERC20Token>[] = [
  // Whitelisted Silo tokens
  ...SILO_WHITELIST,
  // Commonly-used tokens
  WETH,
  CRV3,
  DAI,
  USDC,
  USDT,
];

// Preemptively load balances for these tokens.
export const BALANCE_TOKENS: ChainConstant<NativeToken | ERC20Token>[] = [
  ETH,
  ...ERC20_TOKENS,
];

// Tokens that used the generalized silo whitelist in Beanstalk V1.
export const GENERALIZED_SILO_WHITELIST: ChainConstant<ERC20Token>[] = [
  BEAN_CRV3_LP,
  BEAN_LUSD_LP,
  UNRIPE_BEAN,
  UNRIPE_BEAN_CRV3
];

// Assets underlying 3CRV (accessible when depositing/removing liquidity)
export const CRV3_UNDERLYING: ChainConstant<ERC20Token>[] = [
  DAI,
  USDC,
  USDT,
];
