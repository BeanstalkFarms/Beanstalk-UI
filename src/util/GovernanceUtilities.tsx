import { beanstalkContract } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

export const vote = async (
  bip,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().vote(bip),
  { onResponse }
);

export const unvote = async (
  bip,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  beanstalkContract().unvote(bip),
  { onResponse }
);

// Decides what function the user should call when voting for bips
export const megaVote = async (
  bipList: Array,
  onResponse: TxnCallbacks['onResponse']
) => {
  const bips = bipList.map((b) => b[0]);
  const [voted, unvoted] = bipList.reduce(([vb, ub], bip) => (bip[2] ? [true, ub] : [vb, true]), [false, false]);
  const bs = beanstalkContract();
  let voteFunction;
  if (bips.length === 1) voteFunction = unvoted ? bs.vote(bips[0]) : bs.unvote(bips[0]);
  else if (voted) voteFunction = unvoted ? bs.voteUnvoteAll(bips) : bs.unvoteAll(bips);
  else voteFunction = bs.voteAll(bips);
  handleCallbacks(
    voteFunction,
    { onResponse }
  );
};

export const percentForStalk = (stalk, totalStalk) =>
  stalk.dividedBy(totalStalk).multipliedBy(100).decimalPlaces(2).toNumber();
