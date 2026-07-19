import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { prisma } from '@todo-learn/database';
import { CategoryDto } from '../../contracts/category.dto';
import { GetCategoriesQuery } from '../../contracts/get-categories.query';

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  async execute(query: GetCategoriesQuery): Promise<CategoryDto[]> {
    return prisma.category.findMany({
      where: { userId: query.userId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
