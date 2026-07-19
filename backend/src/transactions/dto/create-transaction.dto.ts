import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { TransactionType } from '@todo-learn/database';

export class CreateTransactionDto {
  // Строка, а не number: при transform:true число превратилось бы во float и
  // потеряло денежную точность. Prisma создаёт Decimal из строки.
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'amount должен быть положительным числом с не более чем 2 знаками после точки',
  })
  amount!: string;

  @IsEnum(TransactionType, { message: 'type должен быть income или expense' })
  type!: TransactionType;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'date должен быть в формате ISO 8601' })
  date?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;
}
