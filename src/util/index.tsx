import { ethers } from 'ethers';

import { changeTheme } from 'constants/index';
import { changeTokenAddresses } from 'constants/tokens';
import { SupportedChainId } from 'constants/chains';
import { ALCHEMY_HTTPS_URLS } from 'constants/rpc/alchemy';

// -- Exports
// export * from './SeasonUtilities';
// export * from './SiloUtilities';
// export * from './CurveUtilities';
export * from './TokenUtilities';
// export * from './TimeUtilities';
// export * from './UniswapUtilities';
// export * from './TimeUtilities';
// export * from './APYUtilities';
// export * from './FundraiserUtilities';
// export * from './MarketUtilities';
export type EventData = ethers.Event

// -- Globals
export let chainId : SupportedChainId = 1; // fixme
export const account = null;
export const PRIMARY_CHAIN_ID = SupportedChainId.RINKEBY;
export const RPC_HOST = ALCHEMY_HTTPS_URLS[PRIMARY_CHAIN_ID];
export const provider = new ethers.providers.JsonRpcProvider(RPC_HOST);

// -- Helpers
export async function switchChain(_chainId: SupportedChainId) {
  // Update chain information, tokens, theme
  chainId = _chainId;
  changeTokenAddresses(chainId);
  if (chainId === 1) changeTheme('spring');
  if (chainId === 3) changeTheme('ropsten');
}

export function getPreviouslyConnectedWallets() : null | string[] {
  return JSON.parse(
    window.localStorage.getItem('connectedWallets') || 'null',
  );
}

export function trimAddress(address: string) {
  return `${address.substring(0, 6)}..${address.slice(-4)}`;
}

const ordinalRulesEN = new Intl.PluralRules('en', { type: 'ordinal' });
const suffixes = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th'
};

export function ordinal(number: number) : string {
  const category = ordinalRulesEN.select(number);
  const suffix = suffixes[category];
  return (number + suffix);
}
