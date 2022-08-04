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

export const BEANETH_UNIV2_MAINNET = new UniswapV2Pool(
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

// ------------------------------------
// BEAN:CRV3 Curve MetaPool
// ------------------------------------

export const BEANCRV3_CURVE_MAINNET = new CurveMetaPool(
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

/// this is the Replanted Bean:3CRV pool
export const REPLANTED_BEANCRV3_CURVE_LOCALHOST = new CurveMetaPool(
  SupportedChainId.LOCALHOST, // FIXME: update mainnet addr post-replant
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
    [BEANETH_UNIV2_MAINNET.address]: BEANETH_UNIV2_MAINNET,
    [BEANCRV3_CURVE_MAINNET.address]: BEANCRV3_CURVE_MAINNET,
    [BEAN_LUSD_CURVE_POOL_MAINNET.address]: BEAN_LUSD_CURVE_POOL_MAINNET,
  },
  [SupportedChainId.PHOENIX]: {
    [REPLANTED_BEANCRV3_CURVE_LOCALHOST.address]: REPLANTED_BEANCRV3_CURVE_LOCALHOST,
  },
  [SupportedChainId.LOCALHOST]: {
    [REPLANTED_BEANCRV3_CURVE_LOCALHOST.address]: REPLANTED_BEANCRV3_CURVE_LOCALHOST,
  },
};

export default ALL_POOLS;
