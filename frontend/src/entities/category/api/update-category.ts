import { authFetch } from '@/shared/api';
import type { Category, UpdateCategoryInput } from '../model/types';

/** PATCH /categories/:id — изменить категорию. 404, если чужая или не найдена. */
export function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  return authFetch<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: input,
  });
}
