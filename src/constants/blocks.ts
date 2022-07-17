import { SupportedChainId } from './chains';

export const DEPLOYMENT_BLOCKS = {
  [SupportedChainId.MAINNET]: {
    BEANSTALK_GENESIS_BLOCK: 12974075, // beanstalk initial launch
    BIP10_COMMITTED_BLOCK: 14148509, // marketplace live
    FERTILIZER_LAUNCH_BLOCK: 14915800, // first FERT purchase
  },
  [SupportedChainId.ROPSTEN]: {
    BEANSTALK_GENESIS_BLOCK: 0,
    BIP10_COMMITTED_BLOCK: 0,
    FERTILIZER_LAUNCH_BLOCK: 0,
  },
};
