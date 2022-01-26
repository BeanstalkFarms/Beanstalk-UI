import { changeAddresses } from './tokens';
import { changeTheme } from './colors';

export * from './bips';
export * from './links';
export * from './funds';
export * from './tokens';
export * from './values';
export * from './colors';

export function changeNetwork(chainId) {
    changeAddresses(chainId);
    if (chainId === 1) changeTheme('main');
    if (chainId === 3) changeTheme('ropsten');
}
