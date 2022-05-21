import Pool, { UniswapV2Pool } from 'classes/Pool';
import { SupportedChainId } from 'constants/chains';
import { Uniswap } from './dexes';
import { BEAN, BEAN_ETH_UNISWAP_V2_LP, WETH } from './tokens';

export const BEAN_ETH_UNISWAP_V2_POOL_MAINNET = new UniswapV2Pool(
  '0x87898263B6C5BABe34b4ec53F22d98430b91e371',
  SupportedChainId.MAINNET,
  Uniswap,
  BEAN_ETH_UNISWAP_V2_LP[SupportedChainId.MAINNET],
  [BEAN[SupportedChainId.MAINNET], WETH[SupportedChainId.MAINNET]],
  {
    name: 'Bean:ETH Uniswap V2 Pool',
    logo: undefined,
    symbol: undefined
  },
);

export const BEAN_ETH_UNISWAP_V2_POOL_ROPSTEN = new UniswapV2Pool(
  '0x298c5f1f902c5bDc2936eb44b3E0E8675F40B8db',
  SupportedChainId.ROPSTEN,
  Uniswap,
  BEAN_ETH_UNISWAP_V2_LP[SupportedChainId.ROPSTEN],
  [BEAN[SupportedChainId.ROPSTEN], WETH[SupportedChainId.ROPSTEN]],
  {
    name: 'Bean:ETH Uniswap V2 Pool',
    logo: undefined,
    symbol: undefined
  },
);

// --------------------------------------------------

const Pools : { 
  [chainId: number]: { 
    [address: string] : Pool
  }
} = {
  [SupportedChainId.MAINNET]: {
    [BEAN_ETH_UNISWAP_V2_POOL_MAINNET.address]: BEAN_ETH_UNISWAP_V2_POOL_MAINNET,
  },
  [SupportedChainId.ROPSTEN]: {
    [BEAN_ETH_UNISWAP_V2_POOL_ROPSTEN.address]: BEAN_ETH_UNISWAP_V2_POOL_ROPSTEN,
  }
};

export default Pools;