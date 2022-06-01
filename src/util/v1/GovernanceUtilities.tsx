import { ContractTransaction } from 'ethers';
import { beanstalkContract } from '../index';
import { handleCallbacks, TxnCallbacks } from '../TxnUtilities';

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
// vote -> vote on 1 BIP
// unvote -> unvote on 1 BIP
// voteAll -> vote on multiple BIPs
// unvoteAll -> unvote on multiple BIPs
// voteUnvoteAll -> vote or unvote multiple BIPs (depending on current voter status)
export const megaVote = async (
  bipList: any[],
  onResponse: TxnCallbacks['onResponse']
) => {
  const bips = bipList.map((b) => b[0]);
  const [voted, unvoted] = bipList.reduce(([vb, ub], bip) => (bip[2] ? [true, ub] : [vb, true]), [false, false]);
  const bs = beanstalkContract();

  let voteFunction : Promise<ContractTransaction>;
  if (bips.length === 1) voteFunction = unvoted ? bs.vote(bips[0]) : bs.unvote(bips[0]);
  else if (voted) voteFunction = unvoted ? bs.voteUnvoteAll(bips) : bs.unvoteAll(bips);
  else voteFunction = bs.voteAll(bips);

  return handleCallbacks(
    voteFunction,
    { onResponse }
  );
};

// When BIP is commitable, any wallet can call the commit function to commit to mainnet
export const commit = async (
  bip,
  onResponse: TxnCallbacks['onResponse']
) => {
  const estGas = await beanstalkContract().estimateGas.commit(bip);
  const newGas = (parseInt(estGas.toString(), 10) * 1.5).toString(); // overestimate gas so transaction doesnt revert
  return handleCallbacks(
    beanstalkContract().commit(bip, { gasLimit: newGas }),
    { onResponse }
  );
};

// When BIP is emergency commitable, any wallet can call the emergencyCommit function to commit to mainnet
export const emergencyCommit = async (
  bip,
  onResponse: TxnCallbacks['onResponse']
) => {
  const estGas = await beanstalkContract().estimateGas.emergencyCommit(bip);
  const newGas = (parseInt(estGas.toString(), 10) * 1.5).toString(); // overestimate gas so transaction doesnt revert
  console.log(newGas);
  return handleCallbacks(
    beanstalkContract().emergencyCommit(bip, { gasLimit: newGas }),
    { onResponse }
  );
};

export const percentForStalk = (stalk, totalStalk) =>
  stalk.dividedBy(totalStalk).multipliedBy(100).decimalPlaces(2).toNumber();
