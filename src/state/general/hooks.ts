import { useSelector } from 'react-redux';
import { last } from 'lodash';
import { AppState } from 'state';

export function useLatestTransactionNumber(): Number {
  const generalState = useSelector((state: AppState) => state.general);
  if (generalState.transactions.length === 0) {
    return 0;
  }
  return last(generalState.transactions)?.transactionNumber;
}
