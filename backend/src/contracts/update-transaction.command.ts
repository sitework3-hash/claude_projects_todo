import type { TransactionType } from '@todo-learn/database';

/** Частичное обновление транзакции; categoryId может быть null (отвязать категорию). */
export interface UpdateTransactionPatch {
  amount?: string;
  type?: TransactionType;
  date?: string;
  description?: string | null;
  categoryId?: string | null;
}

export class UpdateTransactionCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly patch: UpdateTransactionPatch,
  ) {}
}
