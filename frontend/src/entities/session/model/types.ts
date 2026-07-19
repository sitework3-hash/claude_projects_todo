/** Публичные данные пользователя, которые возвращает API авторизации. */
export interface User {
  id: string;
  name: string | null;
  email: string;
}

/** Результат успешной авторизации/регистрации (тело ответа backend). */
export interface AuthResult {
  accessToken: string;
  user: User;
}
