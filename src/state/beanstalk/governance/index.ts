export type ActiveProposal = {
  id: string | undefined;
  title: string | undefined;
}

export type BeanstalkGovernance = {
  /** IDs of active proposals. */
  activeProposals: Array<ActiveProposal>;
}
