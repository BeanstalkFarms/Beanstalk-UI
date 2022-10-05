import { getDateCountdown } from '~/util/Time';

export const SNAPSHOT_SPACES = [
  'beanstalkdao.eth',
  'beanstalkfarms.eth',
  'wearebeansprout.eth'
];

export type Proposal = {
  /**  */
  id: string;
  /**  */
  title: string;
  /** The voting options. */
  choices?: string[];
  /** Markdown of the proposal. */
  body?: string;
  /** Voting type (i.e. single-choice, etc.) */
  type: string;
  /** When the voting period opens. */
  start: number;
  /** When the voting period closes. */
  end: number;
  /** URL to the proposal on Snapshot. */
  link?: string;
  /** The amount of STALK that has voted for each choice. */
  scores: number[];
  /** Total STALK that has voted. */
  scores_total: number;
  /** Last time the scores were updated. */
  scores_updated?: number;
  /** Whether the proposal is active or closed. */
  state: string;
  /** snapshot.org/#/<space.eth> */
  space: {
    /**  */
    id: string;
    /**  */
    name?: string;
  }
}

/**
 * Formats date messages for governance proposal.
 * @returns string
 */
export const getDateMessage = (end: number) => {
  const [message, active] = getDateCountdown(end * 1000);
  return active ? `Vote ends ${message}` : `Ended ${message}`;
};

/**
 * Splits a typical proposal title after the colon (ex. BIP-24).
 * @note Could use a regex like `^(BIP|BOP)-[0-9]+`.
 * @returns string | null if no colon found
 */
export const getProposalTag = (title: string) => {
  const sep = title.indexOf(':', 5);
  return (
    sep > -1
      ? title.substring(0, sep)
      : null
  );
};
