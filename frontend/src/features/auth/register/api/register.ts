import { apiFetch } from '@/shared/api';
import type { AuthResult } from '@/entities/session';
import type { RegisterValues } from '../model/schema';

/** POST /auth/register → { accessToken, user }. confirmPassword на backend не отправляется. */
export function register(values: RegisterValues): Promise<AuthResult> {
  const name = values.name?.trim();
  return apiFetch<AuthResult>('/auth/register', {
    method: 'POST',
    body: {
      ...(name ? { name } : {}),
      email: values.email,
      password: values.password,
    },
  });
}
