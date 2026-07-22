import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateTransactionHandler } from './commands/create-transaction.handler';
import { DeleteTransactionHandler } from './commands/delete-transaction.handler';
import { UpdateTransactionHandler } from './commands/update-transaction.handler';
import { GetLatestTransactionsHandler } from './queries/get-latest-transactions.handler';
import { GetTransactionByIdHandler } from './queries/get-transaction-by-id.handler';
import { GetTransactionsHandler } from './queries/get-transactions.handler';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [CqrsModule],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    CreateTransactionHandler,
    UpdateTransactionHandler,
    DeleteTransactionHandler,
    GetTransactionsHandler,
    GetLatestTransactionsHandler,
    GetTransactionByIdHandler,
  ],
})
export class TransactionsModule {}
