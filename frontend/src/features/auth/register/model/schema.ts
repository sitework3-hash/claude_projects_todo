import { z } from 'zod';

/**
 * Схема формы регистрации. Поля email/password совпадают с backend (RegisterDto),
 * name опционально, confirmPassword — только для UX-проверки на клиенте.
 */
export const registerSchema = z
  .object({
    name: z.string().trim().max(60, 'Слишком длинное имя').optional(),
    email: z.email('Введите корректный email'),
    password: z.string().min(8, 'Пароль должен быть не короче 8 символов'),
    confirmPassword: z.string(),
    agreement: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })
  .refine((data) => data.agreement === true, {
    message: 'Необходимо принять условия, чтобы продолжить',
    path: ['agreement'],
  });

export type RegisterValues = z.infer<typeof registerSchema>;
