import { SupportedChainId } from '../chains';

/**
 * Below Alchemy keys owned by eng@bean.farm.
 */
export const ALCHEMY_API_KEYS : { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: 'iByabvqm_66b_Bkl9M-wJJGdCTuy19R3',
  [SupportedChainId.ROPSTEN]: 'ds4ljBC_Pq-PaIQ3aHo04t27y2n8qpry',
  [SupportedChainId.LOCALHOST]: '',
};