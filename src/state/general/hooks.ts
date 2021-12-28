import { useSelector } from 'react-redux';
import { last } from 'lodash';
import { AppState } from 'state';
import { Transaction } from './actions';

export function useLatestTransactionNumber(): Number {
  const generalState = useSelector((state: AppState) => state.general);
  if (generalState.transactions.length === 0) {
    return 0;
  }
  return last(generalState.transactions)?.transactionNumber;
}

export function useTransactions(): Transaction[] {
  const transcations = useSelector(
    (state: AppState) => state.general.transcations
  );

  return transcations;
}
