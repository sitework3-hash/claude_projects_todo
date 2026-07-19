import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { prisma } from '@todo-learn/database';
import { GetLatestTransactionsQuery } from '../../contracts/get-latest-transactions.query';
import { toTransactionDto } from '../transaction.mapper';
import type { TransactionDto } from '../../contracts/transaction.dto';

@QueryHandler(GetLatestTransactionsQuery)
export class GetLatestTransactionsHandler implements IQueryHandler<GetLatestTransactionsQuery> {
  async execute(query: GetLatestTransactionsQuery): Promise<TransactionDto[]> {
    const rows = await prisma.transaction.findMany({
      where: { userId: query.userId },
      orderBy: { date: 'desc' },
      take: query.limit,
      skip: query.offset,
    });
    return rows.map(toTransactionDto);
  }
}
