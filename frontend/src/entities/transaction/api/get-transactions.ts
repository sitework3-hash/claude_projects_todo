import { authFetch } from '@/shared/api';
import type { TransactionsSummary } from '../model/types';

interface GetTransactionsParams {
  month?: number;
  year?: number;
}

/** GET /transactions?month&year — список за период + итоги. */
export function getTransactions({ month, year }: GetTransactionsParams = {}): Promise<TransactionsSummary> {
  const params = new URLSearchParams();
  if (month) params.set('month', String(month));
  if (year) params.set('year', String(year));
  const qs = params.toString();
  return authFetch<TransactionsSummary>(`/transactions${qs ? `?${qs}` : ''}`);
}
