import { ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma, prisma } from '@todo-learn/database';
import { CreateUserCommand } from '../../contracts/create-user.command';
import { PublicUser } from '../../contracts/user.dto';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  async execute(command: CreateUserCommand): Promise<PublicUser> {
    const { name, email, passwordHash } = command;

    try {
      return await prisma.user.create({
        data: { name, email, passwordHash },
        select: { id: true, name: true, email: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Пользователь с таким email уже существует');
      }
      throw error;
    }
  }
}
