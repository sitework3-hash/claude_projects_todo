import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { prisma } from '@todo-learn/database';
import { GetUserByEmailQuery } from '../../contracts/get-user-by-email.query';
import { UserWithHash } from '../../contracts/user.dto';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  async execute(query: GetUserByEmailQuery): Promise<UserWithHash | null> {
    return prisma.user.findUnique({
      where: { email: query.email },
      select: { id: true, name: true, email: true, passwordHash: true },
    });
  }
}
