import Pool, { UniswapV2Pool } from 'classes/Pool';
import { SupportedChainId } from 'constants/chains';
import { Uniswap } from './dexes';
import { Bean, BeanEthUniswapLP, Weth } from './tokens';

export const BeanEthUniswapPool = new UniswapV2Pool(
  '0x87898263B6C5BABe34b4ec53F22d98430b91e371',
  SupportedChainId.MAINNET,
  Uniswap,
  BeanEthUniswapLP,
  [Bean, Weth],
  {
    name: 'Bean:ETH Uniswap V2 Pool',
    logo: undefined,
    symbol: undefined
  },
);

// --------------------------------------------------

export const AllPools : Pool[] = [
  BeanEthUniswapPool,
];

export const AllPoolsByAddress : { [address: string] : Pool } = {
  [BeanEthUniswapPool.address]: BeanEthUniswapPool, 
};

class Pools {
  static get(address: string) {
    return AllPoolsByAddress[address];
  }

  static has(address: string) : boolean {
    return (address in AllPoolsByAddress);
  }

  static all = AllPools;
}

export default Pools;
