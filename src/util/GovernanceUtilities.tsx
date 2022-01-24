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

export const percentForStalk = (stalk, totalStalk) =>
  stalk.dividedBy(totalStalk).multipliedBy(100).decimalPlaces(2).toNumber();
