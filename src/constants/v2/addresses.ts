import { SupportedChainId } from '../chains';

export type AddressMap = { [chainId: number]: string }

export const BEANSTALK_ADDRESSES : AddressMap = {
  [SupportedChainId.MAINNET]: '0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5',
  [SupportedChainId.ROPSTEN]: '0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5',
  [SupportedChainId.ROPSTEN]: '0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5',
};
export const BEANSTALK_PRICE_ADDRESSES : AddressMap = {
  [SupportedChainId.MAINNET]: '0xcB64964117ae6dc6FaB049531Ed63dF949dCf6aF',
  [SupportedChainId.ROPSTEN]: '0xB721C3386052389892A898EC700619A7Ab20C6B7',
};

export const BEANSTALK_FERTILIZER_ADDRESSES : AddressMap = {
  [SupportedChainId.RINKEBY]: '0xe859C94462B77A600f64Dc742b1D06cE17B256b1'
}