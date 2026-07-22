import Link from 'next/link';

import { Card, CardHeader, CardTitle } from '@/shared/ui';

export function NavMenu() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link href="/transactions">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-lg">💳 Транзакции</CardTitle>
          </CardHeader>
        </Card>
      </Link>
      <Link href="/categories">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-lg">🏷️ Категории</CardTitle>
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
}
