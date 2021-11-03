import { changeAddresses } from './tokens';
import { changeTheme } from './colors';

export * from './bips';
export * from './links';
export * from './tokens';
export * from './values';
export * from './colors';

export function changeNetwork(chainId) {
    changeAddresses(chainId);
    if (chainId === 1) changeTheme('normal');
    if (chainId === 3) changeTheme('ropsten');
}
