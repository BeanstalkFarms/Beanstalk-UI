import { beanstalkContract, txCallback } from './index';

export const vote = async (bip, callback) => {
  beanstalkContract()
    .vote(bip)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

export const unvote = async (bip, callback) => {
  beanstalkContract()
    .unvote(bip)
    .then((response) => {
      callback();
      response.wait().then(() => {
        txCallback();
      });
    });
};

// Decides what function the user should call when voting for bips
export const megaVote = async (bipList: Array) => {
  const bips = bipList.map((b) => b[0]);
  const [voted, unvoted] = bipList.reduce(([vb, ub], bip) => (bip[2] ? [true, ub] : [vb, true]), [false, false]);
  const bs = beanstalkContract();
  let voteFunction;
  if (bips.length === 1) voteFunction = unvoted ? bs.vote(bips[0]) : bs.unvote(bips[0]);
  else if (voted) voteFunction = unvoted ? bs.voteUnvoteAll(bips) : bs.unvoteAll(bips);
  else voteFunction = bs.voteAll(bips);
  voteFunction.then((response) => {
    response.wait().then(() => {
      txCallback();
    });
  });
};

export const percentForStalk = (stalk, totalStalk) =>
  stalk.dividedBy(totalStalk).multipliedBy(100).decimalPlaces(2).toNumber();
