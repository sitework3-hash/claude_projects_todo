import { z } from 'zod';

/** Схема формы входа. Совпадает с валидацией backend (LoginDto). */
export const loginSchema = z.object({
  email: z.email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен быть не короче 8 символов'),
  agreement: z.boolean().refine((value) => value === true, {
    message: 'Необходимо принять условия, чтобы продолжить',
  }),
});

export type LoginValues = z.infer<typeof loginSchema>;
