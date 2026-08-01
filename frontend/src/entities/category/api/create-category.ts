import { authFetch } from '@/shared/api';
import type { Category, CreateCategoryInput } from '../model/types';

/** POST /categories — создать категорию. 409, если имя занято. */
export function createCategory(input: CreateCategoryInput): Promise<Category> {
  return authFetch<Category>('/categories', {
    method: 'POST',
    body: input,
  });
}
