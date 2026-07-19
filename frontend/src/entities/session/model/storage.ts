import type { AuthResult, User } from './types';

const TOKEN_KEY = 'todo_learn.token';
const USER_KEY = 'todo_learn.user';

/** Безопасно ли обращаться к localStorage (не SSR). */
const canUseStorage = () => typeof window !== 'undefined';

/** Сохраняет токен и пользователя после успешной авторизации. */
export function saveSession({ accessToken, user }: AuthResult): void {
  if (!canUseStorage()) return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Читает токен из хранилища. */
export function readToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Читает пользователя из хранилища; при повреждённых данных возвращает null. */
export function readUser(): User | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/** Полностью очищает сессию (выход). */
export function clearSession(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
