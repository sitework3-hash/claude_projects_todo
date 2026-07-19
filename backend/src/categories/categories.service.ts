import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CategoryDto } from '../contracts/category.dto';
import { CreateCategoryCommand } from '../contracts/create-category.command';
import { DeleteCategoryCommand } from '../contracts/delete-category.command';
import { GetCategoriesQuery } from '../contracts/get-categories.query';
import { GetUserByIdQuery } from '../contracts/get-user-by-id.query';
import { UpdateCategoryCommand, UpdateCategoryPatch } from '../contracts/update-category.command';
import { PublicUser } from '../contracts/user.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(userId: string, dto: CreateCategoryDto): Promise<CategoryDto> {
    const user = await this.queryBus.execute<GetUserByIdQuery, PublicUser | null>(new GetUserByIdQuery(userId));

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return this.commandBus.execute<CreateCategoryCommand, CategoryDto>(
      new CreateCategoryCommand(userId, dto.name, dto.color, dto.icon),
    );
  }

  findAll(userId: string): Promise<CategoryDto[]> {
    return this.queryBus.execute<GetCategoriesQuery, CategoryDto[]>(new GetCategoriesQuery(userId));
  }

  update(userId: string, id: string, dto: UpdateCategoryDto): Promise<CategoryDto> {
    const patch: UpdateCategoryPatch = dto;
    return this.commandBus.execute<UpdateCategoryCommand, CategoryDto>(
      new UpdateCategoryCommand(userId, id, patch),
    );
  }

  remove(userId: string, id: string): Promise<void> {
    return this.commandBus.execute<DeleteCategoryCommand, void>(new DeleteCategoryCommand(userId, id));
  }
}
