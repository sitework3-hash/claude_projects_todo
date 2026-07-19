import type { Metadata } from 'next';

import { TransactionsView } from '@/views/transactions';

export const metadata: Metadata = {
  title: 'Транзакции — Трекер расходов',
};

export default function TransactionsPage() {
  return <TransactionsView />;
}
