import { authFetch } from '@/shared/api';
import type { CreateTransactionInput, Transaction } from '../model/types';

/** POST /transactions — создать транзакцию. */
export function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  return authFetch<Transaction>('/transactions', {
    method: 'POST',
    body: input,
  });
}
