'use client';

import * as React from 'react';

import type { AuthResult, User } from './types';
import { clearSession, readUser, saveSession } from './storage';

interface SessionContextValue {
  user: User | null;
  /** Идёт ли первичное чтение сессии из хранилища. */
  isLoading: boolean;
  /** Сохранить сессию после логина/регистрации. */
  signIn: (result: AuthResult) => void;
  /** Очистить сессию (выход). */
  signOut: () => void;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Первичная гидрация из localStorage (только на клиенте).
  React.useEffect(() => {
    setUser(readUser());
    setIsLoading(false);
  }, []);

  const signIn = React.useCallback((result: AuthResult) => {
    saveSession(result);
    setUser(result.user);
  }, []);

  const signOut = React.useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = React.useMemo<SessionContextValue>(
    () => ({ user, isLoading, signIn, signOut }),
    [user, isLoading, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** Доступ к текущей сессии. Должен вызываться внутри SessionProvider. */
export function useSession(): SessionContextValue {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession должен использоваться внутри <SessionProvider>');
  }
  return ctx;
}
