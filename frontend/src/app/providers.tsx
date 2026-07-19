'use client';

import { SessionProvider } from '@/entities/session';
import { Toaster } from '@/shared/ui';

/** Клиентские провайдеры приложения: сессия + тосты. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster richColors position="top-center" />
    </SessionProvider>
  );
}
