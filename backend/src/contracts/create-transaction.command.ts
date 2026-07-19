import type { TransactionType } from '@todo-learn/database';

export class CreateTransactionCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: string,
    public readonly type: TransactionType,
    public readonly date?: string,
    public readonly description?: string,
    public readonly categoryId?: string,
  ) {}
}
