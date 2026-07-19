import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { prisma } from '@todo-learn/database';
import { DeleteCategoryCommand } from '../../contracts/delete-category.command';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  async execute(command: DeleteCategoryCommand): Promise<void> {
    const { userId, id } = command;

    const { count } = await prisma.category.deleteMany({ where: { id, userId } });

    if (count === 0) {
      throw new NotFoundException('Категория не найдена');
    }
  }
}
