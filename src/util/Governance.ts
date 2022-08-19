// export async function loadProposal() {
//   const proposalData : any = await fetch('/.netlify/functions/proposal').then((response) => response.json());
//   return proposalData;
// }

export type Proposal = {
  /**  */
  id: string;
  /**  */
  title: string;
  /** The voting options. */
  choices: Array<string>;
  /** Markdown of the proposal. */
  body?: string;
  /** Voting type (i.e. single-choice, etc.) */
  type: string;
  /** When the voting period closes. */
  end: number;
  /** URL to the proposal on Snapshot. */
  link?: string;
  /** The amount of STALK that has voted for each choice. */
  scores: Array<number>;
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
 */
export const getDateMessage = (end: number) => {
  /// Dates
  let dateMessage;
  const today   = new Date();
  const endDate = new Date(end * 1000);

  /// Calculations
  const differenceInTime  = endDate.getTime() - today.getTime();
  const differenceInHours = differenceInTime / (1000 * 3600);
  const differenceInDays  = differenceInHours / 24;
  today.setHours(0, 0, 0, 0);

  /// Date is in the future
  if (differenceInHours > 0) {
    if (differenceInHours <= 1) {
      // less than one hour away
      dateMessage = `Vote ends in ${Math.round(differenceInHours * 60)} minutes`;
    } else if (Math.round(differenceInHours) === 1) {
      // exactly one hour away
      dateMessage = `Vote ends in ${Math.round(differenceInHours)} hour`;
    } else if (differenceInHours > 1 && differenceInHours <= 24) {
      // less than one day away
      dateMessage = `Vote ends in ${Math.round(differenceInHours)} hours`;
    } else if (differenceInHours > 24 && differenceInDays <= 7) {
      // less than one week away
      dateMessage = `Vote ends in ${Math.round(differenceInDays)} days`;
    } else if (differenceInDays > 7) {
      // greater than one week away
      dateMessage = `Vote ends on ${endDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}`;
    }
  } else {
    // in the past
    dateMessage = `Ended on ${endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })}`;
  }

  return dateMessage;
};
