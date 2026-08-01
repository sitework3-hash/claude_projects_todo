import { authFetch } from '@/shared/api';

/**
 * DELETE /categories/:id — удалить категорию.
 * Транзакции при этом сохраняются: связь в Prisma объявлена с onDelete: SetNull,
 * у них просто обнуляется categoryId.
 */
export function deleteCategory(id: string): Promise<void> {
  return authFetch<void>(`/categories/${id}`, { method: 'DELETE' });
}
