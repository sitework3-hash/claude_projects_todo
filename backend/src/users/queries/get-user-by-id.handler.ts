import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { prisma } from '@todo-learn/database';
import { GetUserByIdQuery } from '../../contracts/get-user-by-id.query';
import { PublicUser } from '../../contracts/user.dto';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  async execute(query: GetUserByIdQuery): Promise<PublicUser | null> {
    return prisma.user.findUnique({
      where: { id: query.id },
      select: { id: true, name: true, email: true },
    });
  }
}
