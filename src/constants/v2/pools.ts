import { Pool } from 'classes';
import { SupportedChainId } from 'constants/chains';
import { Uniswap } from './dexes';
import { Bean, BeanEthUniswapLP, Weth } from './tokens';

export const BeanEthUniswapPool = new Pool(
  '0x87898263B6C5BABe34b4ec53F22d98430b91e371',
  SupportedChainId.MAINNET,
  Uniswap,
  BeanEthUniswapLP,
  [Bean, Weth],
  'Bean:ETH Uniswap V2 Pool',
  undefined,
  undefined
);

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
