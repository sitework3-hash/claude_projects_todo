import { authFetch } from '@/shared/api';
import type { Transaction } from '../model/types';

interface GetLatestTransactionsParams {
  limit?: number;
  offset?: number;
}

/** GET /transactions/latest?limit&offset — последние N транзакций с пагинацией. */
export function getLatestTransactions({
  limit = 10,
  offset = 0,
}: GetLatestTransactionsParams = {}): Promise<Transaction[]> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (offset > 0) params.set('offset', String(offset));
  const qs = params.toString();
  return authFetch<Transaction[]>(`/transactions/latest${qs ? `?${qs}` : ''}`);
}
