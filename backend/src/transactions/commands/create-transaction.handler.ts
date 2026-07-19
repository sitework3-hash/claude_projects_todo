import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { prisma } from '@todo-learn/database';
import { CreateTransactionCommand } from '../../contracts/create-transaction.command';
import { TransactionDto } from '../../contracts/transaction.dto';
import { toTransactionDto } from '../transaction.mapper';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
  async execute(command: CreateTransactionCommand): Promise<TransactionDto> {
    const { userId, amount, type, date, description, categoryId } = command;

    if (categoryId) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
      if (!category) {
        throw new NotFoundException('Категория не найдена');
      }
    }

    const row = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type,
        description: description ?? null,
        categoryId: categoryId ?? null,
        ...(date ? { date: new Date(date) } : {}),
      },
    });

    return toTransactionDto(row);
  }
}
