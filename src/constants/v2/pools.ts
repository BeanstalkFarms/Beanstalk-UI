import Pool, { CurveMetaPool, CurvePlainPool, UniswapV2Pool } from 'classes/Pool';
import { SupportedChainId } from 'constants/chains';

import curveLogo from 'img/curve-logo.svg';
import uniswapLogo from 'img/uniswap-logo.svg';

import { ChainConstant } from '.';
import { BEAN_CRV3_ADDRESSES, BEAN_ETH_UNIV2_ADDRESSES, BEAN_LUSD_ADDRESSES } from './addresses';
// import { Curve, Uniswap } from './dexes';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, BEAN_LUSD_LP, CRV3, WETH } from './tokens';

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
    symbol: 'BEAN:ETH'
  },
);

export const BEAN_ETH_UNIV2_POOL_ROPSTEN = new UniswapV2Pool(
  SupportedChainId.ROPSTEN,
  BEAN_ETH_UNIV2_ADDRESSES,
  BEAN_ETH_UNIV2_LP,
  [BEAN, WETH],
  {
    name: 'BEAN:ETH Uniswap V2 Pool',
    logo: uniswapLogo,
    symbol: 'BEAN:ETH'
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
    name: 'BEAN:3CRV MetaPool',
    logo: curveLogo,
    symbol: 'BEAN:3CRV'
  },
);

export const BEAN_CRV3_CURVE_POOL_ROPSTEN = new CurveMetaPool(
  SupportedChainId.ROPSTEN,
  BEAN_CRV3_ADDRESSES,
  BEAN_CRV3_LP,
  [BEAN, CRV3],
  {
    name: 'BEAN:3CRV MetaPool',
    logo: curveLogo,
    symbol: 'BEAN:3CRV'
  },
);

// ------------------------------------
// BEAN:LUSD Curve Plain Pool
// ------------------------------------

export const BEAN_LUSD_CURVE_POOL_MAINNET = new CurvePlainPool(
  SupportedChainId.MAINNET,
  BEAN_LUSD_ADDRESSES,
  BEAN_LUSD_LP,
  [BEAN, CRV3],
  {
    name: 'BEAN:LUSD Plain Pool',
    logo: curveLogo,
    symbol: 'BEAN:LUSD'
  },
);

// --------------------------------------------------

export type PoolsByAddress = { [address: string] : Pool };

const Pools : ChainConstant<PoolsByAddress> = {
  [SupportedChainId.MAINNET]: {
    [BEAN_ETH_UNIV2_POOL_MAINNET.address]: BEAN_ETH_UNIV2_POOL_MAINNET,
    [BEAN_CRV3_CURVE_POOL_MAINNET.address]: BEAN_CRV3_CURVE_POOL_MAINNET,
    // [BEAN_LUSD_CURVE_POOL_MAINNET.address]: BEAN_LUSD_CURVE_POOL_MAINNET,
  },
  [SupportedChainId.ROPSTEN]: {
    [BEAN_ETH_UNIV2_POOL_ROPSTEN.address]: BEAN_ETH_UNIV2_POOL_ROPSTEN,
    [BEAN_CRV3_CURVE_POOL_ROPSTEN.address]: BEAN_CRV3_CURVE_POOL_ROPSTEN,
  }
};

export default Pools;
