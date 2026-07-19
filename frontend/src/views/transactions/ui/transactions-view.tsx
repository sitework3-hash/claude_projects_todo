'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { useSession } from '@/entities/session';
import { getCategories, type Category } from '@/entities/category';
import { getTransactions, TransactionItem, type TransactionsSummary } from '@/entities/transaction';
import { TransactionForm } from '@/features/transaction/create';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function formatMoney(value: string): string {
  const [intPart, fraction] = value.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return fraction ? `${grouped}.${fraction}` : grouped;
}

export function TransactionsView() {
  const router = useRouter();
  const { user, isLoading: sessionLoading } = useSession();

  const now = new Date();
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [year, setYear] = useState(now.getUTCFullYear());
  const [summary, setSummary] = useState<TransactionsSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Приватная страница: без сессии — на логин.
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login');
    }
  }, [sessionLoading, user, router]);

  const categoryNames = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const loadData = useCallback(() => {
    getTransactions({ month, year }).then(setSummary).catch(() => setSummary(null));
  }, [month, year]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  useEffect(() => {
    if (user) getCategories().then(setCategories).catch(() => setCategories([]));
  }, [user]);

  if (sessionLoading || !user) {
    return null;
  }

  const years = Array.from({ length: 5 }, (_, i) => now.getUTCFullYear() - i);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Транзакции</h1>
        <div className="flex gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((name, i) => (
                <SelectItem key={i} value={String(i + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Доходы</CardDescription>
            <CardTitle className="text-lg text-green-600 tabular-nums dark:text-green-400">
              {summary ? formatMoney(summary.totals.income) : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Расходы</CardDescription>
            <CardTitle className="text-lg text-red-600 tabular-nums dark:text-red-400">
              {summary ? formatMoney(summary.totals.expense) : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Баланс</CardDescription>
            <CardTitle className="text-lg tabular-nums">
              {summary ? formatMoney(summary.totals.balance) : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Новая транзакция</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm onCreated={loadData} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {summary && summary.transactions.length > 0 ? (
          summary.transactions.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              categoryName={t.categoryId ? categoryNames.get(t.categoryId) : undefined}
            />
          ))
        ) : (
          <p className="text-muted-foreground py-8 text-center text-sm">
            За выбранный период транзакций нет
          </p>
        )}
      </div>
    </main>
  );
}
