import type { TransactionDto } from './transaction.dto';

/** Итоги за период; все суммы — строки (Decimal с фиксированной точностью). */
export interface TransactionTotals {
  income: string;
  expense: string;
  balance: string;
}

/** Ответ GET /transactions: список за период + агрегированные итоги. */
export interface TransactionsSummaryDto {
  transactions: TransactionDto[];
  totals: TransactionTotals;
}
