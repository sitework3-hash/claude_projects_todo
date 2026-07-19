import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTransactionCommand } from '../contracts/create-transaction.command';
import { DeleteTransactionCommand } from '../contracts/delete-transaction.command';
import { GetTransactionByIdQuery } from '../contracts/get-transaction-by-id.query';
import { GetTransactionsQuery } from '../contracts/get-transactions.query';
import { GetUserByIdQuery } from '../contracts/get-user-by-id.query';
import { TransactionDto } from '../contracts/transaction.dto';
import { TransactionsSummaryDto } from '../contracts/transactions-summary.dto';
import { UpdateTransactionCommand, UpdateTransactionPatch } from '../contracts/update-transaction.command';
import { PublicUser } from '../contracts/user.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(userId: string, dto: CreateTransactionDto): Promise<TransactionDto> {
    const user = await this.queryBus.execute<GetUserByIdQuery, PublicUser | null>(
      new GetUserByIdQuery(userId),
    );

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return this.commandBus.execute<CreateTransactionCommand, TransactionDto>(
      new CreateTransactionCommand(userId, dto.amount, dto.type, dto.date, dto.description, dto.categoryId),
    );
  }

  findAll(userId: string, month?: number, year?: number): Promise<TransactionsSummaryDto> {
    return this.queryBus.execute<GetTransactionsQuery, TransactionsSummaryDto>(
      new GetTransactionsQuery(userId, month, year),
    );
  }

  findOne(userId: string, id: string): Promise<TransactionDto> {
    return this.queryBus.execute<GetTransactionByIdQuery, TransactionDto>(
      new GetTransactionByIdQuery(userId, id),
    );
  }

  update(userId: string, id: string, dto: UpdateTransactionDto): Promise<TransactionDto> {
    const patch: UpdateTransactionPatch = dto;
    return this.commandBus.execute<UpdateTransactionCommand, TransactionDto>(
      new UpdateTransactionCommand(userId, id, patch),
    );
  }

  remove(userId: string, id: string): Promise<void> {
    return this.commandBus.execute<DeleteTransactionCommand, void>(
      new DeleteTransactionCommand(userId, id),
    );
  }
}
