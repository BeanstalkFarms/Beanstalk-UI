import { changeAddresses } from './tokens';
import { changeTheme } from './colors';

export * from './bips';
export * from './links';
export * from './funds';
export * from './tokens';
export * from './values';
export * from './colors';
export * from './contracts';
export * from './tokensv2';

//
export function changeNetwork(chainId: number) {
    console.log(`changeNetwork: ${chainId}`);
  changeAddresses(chainId);
  if (chainId === 1) changeTheme('winterUpgrade');
  if (chainId === 3) changeTheme('ropsten');
}
