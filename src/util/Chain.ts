import { TESTNET_CHAINS, SupportedChainId } from 'constants/index';

export type ConstantByChain = { [key: number]: any };

export function getChainConstant<T extends ConstantByChain>(
  map: T,
  chainId?: SupportedChainId
): T[keyof T] {
  // If no chain available, use the value for MAINNET.
  if (!chainId || !SupportedChainId[chainId]) {
    return map[SupportedChainId.MAINNET];
  }
  // If we're on a Testnet, it's probably a forked mainnet node.
  // Use Testnet-specific value if available, otherwise
  // fall back to MAINNET. This allows for test forking.
  if (TESTNET_CHAINS.has(chainId)) {
    return map[chainId] || map[SupportedChainId.MAINNET];
  }
  // Return value for the active chainId.
  return map[chainId];
}
