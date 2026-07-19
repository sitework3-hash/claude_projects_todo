import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { prisma } from '@todo-learn/database';
import { DeleteTransactionCommand } from '../../contracts/delete-transaction.command';

@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand> {
  async execute(command: DeleteTransactionCommand): Promise<void> {
    const { userId, id } = command;

    // Фильтр по userId защищает от удаления чужих записей.
    const { count } = await prisma.transaction.deleteMany({ where: { id, userId } });

    if (count === 0) {
      throw new NotFoundException('Транзакция не найдена');
    }
  }
}
