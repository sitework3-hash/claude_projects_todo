'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/shared/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { useSession } from '@/entities/session';
import { TransactionItem, useLatestTransactions } from '@/entities/transaction';
import { NavMenu } from '@/features/navigation';

export function DashboardView() {
  const router = useRouter();
  const { user, isLoading: sessionLoading, signOut } = useSession();
  const { transactions, loading, hasMore, loadMore } = useLatestTransactions();

  // Приватная страница: без сессии — на логин.
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login');
    }
  }, [sessionLoading, user, router]);

  const handleSignOut = () => {
    signOut();
    router.push('/login');
  };

  const handleLoadMore = () => {
    loadMore();
  };

  if (sessionLoading || !user) {
    return null;
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 sm:p-8">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Привет, {user.name ?? 'Пользователь'}!</h1>
          <p className="text-muted-foreground text-sm">Управляйте своими финансами</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Выйти
        </Button>
      </header>

      {/* Navigation Menu */}
      <NavMenu />

      {/* Latest Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Последние транзакции</CardTitle>
            <Link href="/transactions" className="text-sm text-primary hover:underline">
              Все →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading && transactions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">Загрузка…</p>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">Нет транзакций</p>
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.map((t) => (
                <TransactionItem key={t.id} transaction={t} />
              ))}
            </div>
          )}

          {hasMore && transactions.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                {loading ? 'Загрузка…' : 'Показать ещё'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
