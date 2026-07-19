import { apiFetch } from '@/shared/api';
import type { AuthResult } from '@/entities/session';
import type { LoginValues } from '../model/schema';

/** POST /auth/login → { accessToken, user }. agreement — только для UI, на backend не уходит. */
export function login(values: LoginValues): Promise<AuthResult> {
  return apiFetch<AuthResult>('/auth/login', {
    method: 'POST',
    body: { email: values.email, password: values.password },
  });
}
