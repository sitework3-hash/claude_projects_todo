import type { TransactionType } from '@todo-learn/database';

/**
 * Форма транзакции в ответе API.
 * amount — строка: Prisma.Decimal сериализуется в JSON строкой, и мы сохраняем
 * это в типе, чтобы не терять денежную точность на клиенте.
 */
export interface TransactionDto {
  id: string;
  amount: string;
  type: TransactionType;
  description: string | null;
  date: Date;
  categoryId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
