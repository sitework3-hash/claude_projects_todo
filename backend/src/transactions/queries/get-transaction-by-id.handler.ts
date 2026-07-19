import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { prisma } from '@todo-learn/database';
import { GetTransactionByIdQuery } from '../../contracts/get-transaction-by-id.query';
import { TransactionDto } from '../../contracts/transaction.dto';
import { toTransactionDto } from '../transaction.mapper';

@QueryHandler(GetTransactionByIdQuery)
export class GetTransactionByIdHandler implements IQueryHandler<GetTransactionByIdQuery> {
  async execute(query: GetTransactionByIdQuery): Promise<TransactionDto> {
    const { userId, id } = query;

    const row = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!row) {
      throw new NotFoundException('Транзакция не найдена');
    }

    return toTransactionDto(row);
  }
}
