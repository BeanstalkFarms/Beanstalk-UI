import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { Transaction } from './actions';

export function useLatestTransactionNumber(): number {
  const transactions = useSelector((state: AppState) => state.general.transactions);
  if (transactions.length === 0) return 0;
  return transactions[transactions.length - 1].transactionNumber;
}

export function useTransactions(): Transaction[] {
  const transactions = useSelector((state: AppState) => state.general.transactions);
  return transactions;
}
