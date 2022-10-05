import { STALK } from '~/constants/tokens';
import { useProposalQuorumQuery } from '~/generated/graphql';
import { getQuorumPct } from '~/lib/Beanstalk/Governance';
import { getProposalTag, getProposalType, Proposal, toTokenUnitsBN } from '~/util';

export default function useProposalQuorum(proposal: Proposal) {
  const tag = getProposalTag(proposal.title);
  const type = getProposalType(tag);
  const quorumPct = getQuorumPct(type);

  /// Query total stalk at the season right before this proposal
  const query = useProposalQuorumQuery({
    variables: { created_at: proposal?.start },
    fetchPolicy: 'network-only',
    skip: !proposal?.start || !quorumPct,
  });

  const totalStalk = toTokenUnitsBN(query.data?.siloHourlySnapshots[0].totalStalk || 0, STALK.decimals);

  return {
    ...query,
    data: {
      totalStalk,
      tag,
      type,
      quorumPct,
      quorum: quorumPct ? totalStalk.times(quorumPct) : undefined,
    },
  };
}
