import { ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma, prisma } from '@todo-learn/database';
import { CategoryDto } from '../../contracts/category.dto';
import { CreateCategoryCommand } from '../../contracts/create-category.command';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  async execute(command: CreateCategoryCommand): Promise<CategoryDto> {
    const { userId, name, color, icon } = command;

    try {
      return await prisma.category.create({
        data: { userId, name, color, icon },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Категория с таким именем уже существует');
      }
      throw error;
    }
  }
}
