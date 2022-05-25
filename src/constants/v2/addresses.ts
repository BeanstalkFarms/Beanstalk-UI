import { SupportedChainId } from '../chains';

export type AddressMap = { [chainId: number]: string }

export const BEANSTALK_ADDRESSES : AddressMap = {
  [SupportedChainId.MAINNET]: '0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5', // Stays the same
  [SupportedChainId.ROPSTEN]: '0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5', // Stays the same
  [SupportedChainId.ROPSTEN]: '0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5', // Stays the same
};
export const BEANSTALK_PRICE_ADDRESSES : AddressMap = {
  [SupportedChainId.MAINNET]: '0xcB64964117ae6dc6FaB049531Ed63dF949dCf6aF', // Stays the same
  [SupportedChainId.ROPSTEN]: '0xB721C3386052389892A898EC700619A7Ab20C6B7', // Stays the same
};

export const BEANSTALK_FERTILIZER_ADDRESSES : AddressMap = {
  [SupportedChainId.MAINNET]: '',
  [SupportedChainId.ROPSTEN]: '0xd598d3799521a3F95784A81c883ddf1122Ad769B', // Post-Exploit
  [SupportedChainId.RINKEBY]: '0xe859C94462B77A600f64Dc742b1D06cE17B256b1', // Post-Exploit
};

export const BEAN_3CRV_ADDRESSES : AddressMap = {
  [SupportedChainId.MAINNET]: '0x3a70DfA7d2262988064A2D051dd47521E43c9BdD', // Pre-Exploit
  [SupportedChainId.ROPSTEN]: '0xC20628FFFF326c80056e35E39308e4eE0Ff44fFC', // Pre-Exploit
};

export const BEANFT_GENESIS : AddressMap = {
  [SupportedChainId.MAINNET]: '0xa755A670Aaf1FeCeF2bea56115E65e03F7722A79', // Stays the same
  [SupportedChainId.ROPSTEN]: '0xa755A670Aaf1FeCeF2bea56115E65e03F7722A79', // Stays the same
};

export const BEANFT_WINTER : AddressMap = {
  [SupportedChainId.MAINNET]: '0x459895483556daD32526eFa461F75E33E458d9E9', // Stays the same
  [SupportedChainId.ROPSTEN]: '0x459895483556daD32526eFa461F75E33E458d9E9', // Stays the same
};
