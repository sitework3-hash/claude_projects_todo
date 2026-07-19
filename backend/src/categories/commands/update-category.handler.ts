import { ConflictException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma, prisma } from '@todo-learn/database';
import { CategoryDto } from '../../contracts/category.dto';
import { UpdateCategoryCommand } from '../../contracts/update-category.command';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  async execute(command: UpdateCategoryCommand): Promise<CategoryDto> {
    const { userId, id, patch } = command;

    try {
      const { count } = await prisma.category.updateMany({
        where: { id, userId },
        data: patch,
      });

      if (count === 0) {
        throw new NotFoundException('Категория не найдена');
      }

      return await prisma.category.findUniqueOrThrow({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Категория с таким именем уже существует');
      }
      throw error;
    }
  }
}
