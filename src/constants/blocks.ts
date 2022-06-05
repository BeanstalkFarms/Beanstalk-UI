import { SupportedChainId } from './chains';

export enum DeploymentEvent {
  BEANSTALK_GENESIS,
  BIP10_FARMERS_MARKET,
}

export const DEPLOYMENT_BLOCKS = {
  [SupportedChainId.MAINNET]: {
    BEANSTALK_GENESIS_BLOCK: 12974075,
    BIP10_COMMITTED_BLOCK: 14148509
  },
  [SupportedChainId.ROPSTEN]: {
    BEANSTALK_GENESIS_BLOCK: 0,
    BIP10_COMMITTED_BLOCK: 0
  },
  [SupportedChainId.LOCALHOST]: {
    BEANSTALK_GENESIS_BLOCK: 0,
    BIP10_COMMITTED_BLOCK: 0
  },
};
