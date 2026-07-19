import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { TransactionType } from '@todo-learn/database';

export class UpdateTransactionDto {
  @IsOptional()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'amount должен быть положительным числом с не более чем 2 знаками после точки',
  })
  amount?: string;

  @IsOptional()
  @IsEnum(TransactionType, { message: 'type должен быть income или expense' })
  type?: TransactionType;

  // Разрешаем null (стереть описание); валидируем как строку только не-null значения.
  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsString()
  @MaxLength(200)
  description?: string | null;

  @IsOptional()
  @IsISO8601({}, { message: 'date должен быть в формате ISO 8601' })
  date?: string;

  // null — отвязать категорию; строка — привязать к другой.
  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsString()
  categoryId?: string | null;
}
