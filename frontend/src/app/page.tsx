import Link from 'next/link';

import { Button } from '@/shared/ui';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">💸 Трекер расходов</h1>
      <p className="text-muted-foreground">Учёт доходов и расходов.</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/transactions">Мои транзакции</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Войти</Link>
        </Button>
      </div>
    </main>
  );
}
