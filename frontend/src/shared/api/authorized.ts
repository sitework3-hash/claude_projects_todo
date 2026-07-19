import { apiFetch } from './http';

// Ключ токена в localStorage. Дублируется в entities/session (storage.ts) намеренно:
// shared не должен импортировать вышестоящие слои (граница FSD).
const TOKEN_KEY = 'todo_learn.token';

/**
 * Обёртка над apiFetch для авторизованных запросов: сама подставляет Bearer-токен
 * из localStorage. Использовать во всех запросах, требующих аутентификации.
 */
export function authFetch<TResponse>(
  path: string,
  opts: Parameters<typeof apiFetch>[1] = {},
): Promise<TResponse> {
  const token =
    typeof window !== 'undefined' ? (localStorage.getItem(TOKEN_KEY) ?? undefined) : undefined;
  return apiFetch<TResponse>(path, { ...opts, token });
}
