import { z } from 'zod';

/** Схема формы создания транзакции. amount — строка + regex (совпадает с backend). */
export const createTransactionSchema = z.object({
  amount: z
    .string()
    .min(1, 'Укажите сумму')
    .regex(/^\d+(\.\d{1,2})?$/, 'Сумма: положительное число, до 2 знаков после точки'),
  type: z.enum(['income', 'expense']),
  description: z.string().max(200, 'Слишком длинное описание').optional(),
  date: z.string().optional(),
  // "none" — сентинел «без категории» (Radix Select не принимает пустую строку).
  categoryId: z.string().optional(),
});

export type CreateTransactionValues = z.infer<typeof createTransactionSchema>;
