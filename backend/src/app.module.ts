import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // envFilePath задан явно: nest start запускается с cwd=backend/, а .env лежит
    // в корне монорепо — без этого JWT_SECRET не находится и JwtStrategy падает.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] }),
    CqrsModule.forRoot(),
    UsersModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
