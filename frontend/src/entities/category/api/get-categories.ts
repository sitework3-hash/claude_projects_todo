import { authFetch } from '@/shared/api';
import type { Category } from '../model/types';

/** GET /categories — категории текущего пользователя. */
export function getCategories(): Promise<Category[]> {
  return authFetch<Category[]>('/categories');
}
