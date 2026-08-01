import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name?: string;

  // @IsOptional() пропускает и undefined, и null — null здесь означает
  // «сбросить оформление», Prisma запишет NULL в nullable-колонку.
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color должен быть в формате hex, например #ef4444' })
  color?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string | null;
}
