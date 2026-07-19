import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma, prisma } from '@todo-learn/database';
import { UpdateTransactionCommand } from '../../contracts/update-transaction.command';
import { TransactionDto } from '../../contracts/transaction.dto';
import { toTransactionDto } from '../transaction.mapper';

@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler implements ICommandHandler<UpdateTransactionCommand> {
  async execute(command: UpdateTransactionCommand): Promise<TransactionDto> {
    const { userId, id, patch } = command;

    // Привязка к чужой категории запрещена; null — отвязать, разрешено без проверки.
    if (patch.categoryId) {
      const category = await prisma.category.findFirst({ where: { id: patch.categoryId, userId } });
      if (!category) {
        throw new NotFoundException('Категория не найдена');
      }
    }

    // Собираем data только из заданных полей, чтобы не затирать значения undefined.
    const data: Prisma.TransactionUncheckedUpdateManyInput = {};
    if (patch.amount !== undefined) data.amount = patch.amount;
    if (patch.type !== undefined) data.type = patch.type;
    if (patch.description !== undefined) data.description = patch.description;
    if (patch.categoryId !== undefined) data.categoryId = patch.categoryId;
    if (patch.date !== undefined) data.date = new Date(patch.date);

    const { count } = await prisma.transaction.updateMany({ where: { id, userId }, data });

    if (count === 0) {
      throw new NotFoundException('Транзакция не найдена');
    }

    const row = await prisma.transaction.findUniqueOrThrow({ where: { id } });
    return toTransactionDto(row);
  }
}
