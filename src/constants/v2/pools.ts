import Pool, { CurveMetaPool, UniswapV2Pool } from 'classes/Pool';
import { SupportedChainId } from 'constants/chains';
import bean3CrvLogoUrl from 'img/bean-crv3-logo.svg';
import beanEthLogoUrl from 'img/bean-eth-logo.svg';
import { BEAN_ETH_UNIV2_ADDRESSES } from './addresses';
import { Curve, Uniswap } from './dexes';
import { BEAN, BEAN_CRV3_LP, BEAN_ETH_UNIV2_LP, CRV3, WETH } from './tokens';

export const BEAN_ETH_UNIV2_POOL_MAINNET = new UniswapV2Pool(
  BEAN_ETH_UNIV2_ADDRESSES[SupportedChainId.MAINNET],
  SupportedChainId.MAINNET,
  Uniswap,
  BEAN_ETH_UNIV2_LP[SupportedChainId.MAINNET],
  [
    BEAN[SupportedChainId.MAINNET],
    WETH[SupportedChainId.MAINNET],
  ],
  {
    name: 'BEAN:ETH Uniswap V2 Pool',
    logo: beanEthLogoUrl,
    symbol: 'BEAN:ETH'
  },
);

export const BEAN_ETH_UNIV2_POOL_ROPSTEN = new UniswapV2Pool(
  BEAN_ETH_UNIV2_ADDRESSES[SupportedChainId.ROPSTEN],
  SupportedChainId.ROPSTEN,
  Uniswap,
  BEAN_ETH_UNIV2_LP[SupportedChainId.ROPSTEN],
  [
    BEAN[SupportedChainId.ROPSTEN],
    WETH[SupportedChainId.ROPSTEN],
  ],
  {
    name: 'BEAN:ETH Uniswap V2 Pool',
    logo: beanEthLogoUrl,
    symbol: 'BEAN:ETH'
  },
);

export const BEAN_CRV3_CURVE_POOL_ROPSTEN = new CurveMetaPool(
  BEAN_ETH_UNIV2_ADDRESSES[SupportedChainId.ROPSTEN],
  SupportedChainId.ROPSTEN,
  Curve,
  BEAN_CRV3_LP[SupportedChainId.ROPSTEN],
  [
    // Verify 
    BEAN[SupportedChainId.ROPSTEN],
    CRV3[SupportedChainId.ROPSTEN],
  ],
  {
    name: 'BEAN:3CRV MetaPool',
    logo: bean3CrvLogoUrl,
    symbol: 'BEAN:3CRV'
  },
)

// --------------------------------------------------

const Pools : { 
  [chainId: number]: { 
    [address: string] : Pool
  }
} = {
  [SupportedChainId.MAINNET]: {
    [BEAN_ETH_UNIV2_POOL_MAINNET.address]: BEAN_ETH_UNIV2_POOL_MAINNET,
  },
  [SupportedChainId.ROPSTEN]: {
    [BEAN_ETH_UNIV2_POOL_ROPSTEN.address]: BEAN_ETH_UNIV2_POOL_ROPSTEN,
    [BEAN_CRV3_CURVE_POOL_ROPSTEN.address]: BEAN_CRV3_CURVE_POOL_ROPSTEN,
  }
};

export default Pools;
