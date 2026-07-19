export type TransactionType = 'income' | 'expense';

/**
 * Транзакция в ответе API. amount и суммы — строки: backend отдаёт Decimal строкой,
 * храним как есть и форматируем при показе, чтобы не терять точность.
 */
export interface Transaction {
  id: string;
  amount: string;
  type: TransactionType;
  description: string | null;
  date: string;
  categoryId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionTotals {
  income: string;
  expense: string;
  balance: string;
}

/** Ответ GET /transactions: список за период + итоги. */
export interface TransactionsSummary {
  transactions: Transaction[];
  totals: TransactionTotals;
}

/** Данные формы создания транзакции. */
export interface CreateTransactionInput {
  amount: string;
  type: TransactionType;
  description?: string;
  date?: string;
  categoryId?: string;
}
