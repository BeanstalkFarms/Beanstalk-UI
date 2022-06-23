import { beanstalkContract } from './index';
import { handleCallbacks, TxnCallbacks } from './TxnUtilities';

export const fund = async (
  id,
  amount,
  onResponse: TxnCallbacks['onResponse']
) => handleCallbacks(
  () => beanstalkContract().fund(id, amount),
  { onResponse }
);
