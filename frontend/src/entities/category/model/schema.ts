import { z } from 'zod';

/**
 * Схема формы категории — общая для создания и редактирования. Живёт в entities,
 * а не в одном из feature-слайсов: слайсы одного слоя не имеют права
 * импортировать друг друга (FSD), а схема нужна обоим.
 *
 * Ограничения совпадают с backend DTO (name ≤ 50, color — hex из 6 знаков).
 */
export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название').max(50, 'Название не длиннее 50 символов'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Цвет должен быть в формате #rrggbb')
    .nullable(),
  icon: z.string().max(50).nullable(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
