import Pool, { CurveMetaPool, UniswapV2Pool } from 'classes/Pool';
import { SupportedChainId } from 'constants/chains';

import curveLogo from 'img/curve-logo.svg';
import uniswapLogo from 'img/uniswap-logo.svg';

import { ChainConstant } from '.';
import { BEAN_CRV3_ADDRESSES, BEAN_ETH_UNIV2_ADDRESSES } from './addresses';
// import { Curve, Uniswap } from './dexes';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, CRV3, WETH } from './tokens';

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

// --------------------------------------------------

type PoolsByAddress = { [address: string] : Pool };

const Pools : ChainConstant<PoolsByAddress> = {
  [SupportedChainId.MAINNET]: {
    [BEAN_ETH_UNIV2_POOL_MAINNET.address]: BEAN_ETH_UNIV2_POOL_MAINNET,
  },
  [SupportedChainId.ROPSTEN]: {
    [BEAN_ETH_UNIV2_POOL_ROPSTEN.address]: BEAN_ETH_UNIV2_POOL_ROPSTEN,
    [BEAN_CRV3_CURVE_POOL_ROPSTEN.address]: BEAN_CRV3_CURVE_POOL_ROPSTEN,
  }
};

export default Pools;
