import { CurveMetaPool, CurvePlainPool, UniswapV2Pool } from 'classes/Pool';
import { SupportedChainId } from 'constants/chains';

import curveLogo from 'img/dexes/curve-logo.svg';
import uniswapLogo from 'img/dexes/uniswap-logo.svg';

import { ChainConstant, PoolMap } from '.';
import { BEAN_CRV3_ADDRESSES, BEAN_ETH_UNIV2_ADDRESSES, BEAN_LUSD_ADDRESSES } from './addresses';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP, CRV3, LUSD, WETH } from './tokens';

// ------------------------------------
// BEAN:ETH Uniswap V2 Pool
// ------------------------------------

export const BEAN_ETH_UNIV2_POOL_MAINNET = new UniswapV2Pool(
  SupportedChainId.MAINNET,
  BEAN_ETH_UNIV2_ADDRESSES,
  BEAN_ETH_UNIV2_LP,
  [BEAN, WETH],
  {
    name: 'BEAN:ETH Uniswap V2 Pool',
    logo: uniswapLogo,
    symbol: 'BEAN:ETH',
    color: '#6dcb60'
  },
);

export const BEAN_ETH_UNIV2_POOL_ROPSTEN = new UniswapV2Pool(
  SupportedChainId.ROPSTEN,
  BEAN_ETH_UNIV2_ADDRESSES,
  BEAN_ETH_UNIV2_LP,  // lpToken
  [BEAN, WETH],       // tokens
  {
    name: 'BEAN:ETH Uniswap V2 Pool',
    logo: uniswapLogo,
    symbol: 'BEAN:ETH',
    color: '#6dcb60'
  },
);

// ------------------------------------
// BEAN:CRV3 Curve MetaPool
// ------------------------------------

export const BEAN_CRV3_CURVE_POOL_MAINNET = new CurveMetaPool(
  SupportedChainId.MAINNET,
  BEAN_CRV3_ADDRESSES,
  BEAN_CRV3_LP,
  [BEAN, CRV3],
  {
    name: 'BEAN:3CRV Pool',
    logo: curveLogo,
    symbol: 'BEAN:3CRV',
    color: '#ed9f9c'
  },
);

export const BEAN_CRV3_CURVE_POOL_ROPSTEN = new CurveMetaPool(
  SupportedChainId.ROPSTEN,
  BEAN_CRV3_ADDRESSES,
  BEAN_CRV3_LP,
  [BEAN, CRV3],
  {
    name: 'BEAN:3CRV Pool',
    logo: curveLogo,
    symbol: 'BEAN:3CRV',
    color: '#ed9f9c'
  },
);

/// this is the Replanted Bean:3CRV pool
export const BEAN_CRV3_CURVE_POOL_PHOENIX = new CurveMetaPool(
  SupportedChainId.PHOENIX,
  BEAN_CRV3_ADDRESSES,
  BEAN_CRV3_LP,
  [BEAN, CRV3],
  {
    name: 'BEAN:3CRV Pool',
    logo: curveLogo,
    symbol: 'BEAN:3CRV',
    color: '#ed9f9c'
  },
);

// ------------------------------------
// BEAN:LUSD Curve Plain Pool
// ------------------------------------

export const BEAN_LUSD_CURVE_POOL_MAINNET = new CurvePlainPool(
  SupportedChainId.MAINNET,
  BEAN_LUSD_ADDRESSES,
  BEAN_LUSD_LP,
  [BEAN, LUSD],
  {
    name: 'BEAN:LUSD Pool',
    logo: curveLogo,
    symbol: 'BEAN:LUSD',
    color: '#549e3f'
  },
);

// --------------------------------------------------

export const ALL_POOLS: ChainConstant<PoolMap> = {
  [SupportedChainId.MAINNET]: {
    [BEAN_ETH_UNIV2_POOL_MAINNET.address]: BEAN_ETH_UNIV2_POOL_MAINNET,
    [BEAN_CRV3_CURVE_POOL_MAINNET.address]: BEAN_CRV3_CURVE_POOL_MAINNET,
    [BEAN_LUSD_CURVE_POOL_MAINNET.address]: BEAN_LUSD_CURVE_POOL_MAINNET,
  },
  [SupportedChainId.ROPSTEN]: {
    [BEAN_ETH_UNIV2_POOL_ROPSTEN.address]: BEAN_ETH_UNIV2_POOL_ROPSTEN,
    [BEAN_CRV3_CURVE_POOL_ROPSTEN.address]: BEAN_CRV3_CURVE_POOL_ROPSTEN,
  },
  [SupportedChainId.PHOENIX]: {
    [BEAN_CRV3_CURVE_POOL_PHOENIX.address]: BEAN_CRV3_CURVE_POOL_PHOENIX,
  },
  [SupportedChainId.LOCALHOST]: {
    [BEAN_CRV3_CURVE_POOL_PHOENIX.address]: BEAN_CRV3_CURVE_POOL_PHOENIX,
  },
  [SupportedChainId.CUJO]: {
    [BEAN_CRV3_CURVE_POOL_PHOENIX.address]: BEAN_CRV3_CURVE_POOL_PHOENIX,
  }
};

export default ALL_POOLS;
