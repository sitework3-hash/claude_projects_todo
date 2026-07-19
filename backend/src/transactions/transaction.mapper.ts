import type { Transaction } from '@todo-learn/database';
import { TransactionDto } from '../contracts/transaction.dto';

/** Приводит строку БД к контракту API: Decimal → строка с фиксированной точностью. */
export function toTransactionDto(row: Transaction): TransactionDto {
  return {
    id: row.id,
    amount: row.amount.toFixed(2),
    type: row.type,
    description: row.description,
    date: row.date,
    categoryId: row.categoryId,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
