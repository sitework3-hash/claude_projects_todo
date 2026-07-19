import { API_URL } from '@/shared/config/env';

/** Ошибка HTTP-запроса с кодом статуса и (по возможности) сообщением от API. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Тело запроса; сериализуется в JSON автоматически. */
  body?: unknown;
  /** Bearer-токен, если запрос требует авторизации. */
  token?: string;
}

/**
 * Тонкая обёртка над fetch: базовый URL, JSON, единый разбор ошибок.
 * Тело ошибки Nest — { message: string | string[] }.
 */
export async function apiFetch<TResponse>(
  path: string,
  { body, token, headers, ...init }: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const raw = (payload as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(raw) ? raw.join(', ') : (raw ?? `Ошибка запроса (${response.status})`);
    throw new HttpError(response.status, message);
  }

  return payload as TResponse;
}
