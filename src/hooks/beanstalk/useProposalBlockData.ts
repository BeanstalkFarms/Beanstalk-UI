import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { STALK } from '~/constants/tokens';
import { useBeanstalkContract } from '~/hooks/ledger/useContract';
import { getQuorumPct } from '~/lib/Beanstalk/Governance';
import { getProposalTag, getProposalType, Proposal, tokenResult } from '~/util';

export default function useProposalBlockData(
  proposal: Proposal,
  account?: string,
) {
  /// Proposal info
  const tag = getProposalTag(proposal.title);
  const type = getProposalType(tag);
  const quorumPct = getQuorumPct(type); // undefined if there is no set quorum

  /// Beanstalk
  const beanstalk = useBeanstalkContract();
  const [totalStalk, setTotalStalk] = useState<undefined | BigNumber>(undefined);
  const [votingPower, setVotingPower] = useState<undefined | BigNumber>(undefined);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    (async () => {
      try {
        if (!proposal.snapshot) return;
        const blockTag = parseInt(proposal.snapshot, 10);
        const stalkResult = tokenResult(STALK);
        const [_totalStalk, _votingPower] = await Promise.all([
          beanstalk.totalStalk({ blockTag }).then(stalkResult),
          account ? beanstalk.balanceOfStalk(account, { blockTag }).then(stalkResult) : Promise.resolve(undefined),
        ]);
        setTotalStalk(_totalStalk);
        setVotingPower(_votingPower);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [beanstalk, tag, proposal.snapshot, account]);

  const data = {
    /** The proposal tag (BIP-0) */
    tag,
    /** The proposal type (BIP) */
    type,
    /** The percentage of outstanding stalk that needs to vote to reach Quorum for this `type`. */
    quorumPct,
    /** The total outstanding Stalk at the proposal block. */
    totalStalk,
    /** The total number of Stalk needed to reach quorum. */
    quorum: (quorumPct && totalStalk) ? totalStalk.times(quorumPct) : undefined,
    /** The voting power (in Stalk) of `account` at the proposal block. */
    votingPower,
  };

  return {
    loading,
    data,
  };
}
