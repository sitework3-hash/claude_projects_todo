import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryHandler } from './commands/create-category.handler';
import { DeleteCategoryHandler } from './commands/delete-category.handler';
import { UpdateCategoryHandler } from './commands/update-category.handler';
import { GetCategoriesHandler } from './queries/get-categories.handler';

@Module({
  imports: [CqrsModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CreateCategoryHandler,
    UpdateCategoryHandler,
    DeleteCategoryHandler,
    GetCategoriesHandler,
  ],
})
export class CategoriesModule {}
