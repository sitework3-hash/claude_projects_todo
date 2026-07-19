import { cn } from '@/shared/lib/utils';
import type { Transaction } from '../model/types';

interface TransactionItemProps {
  transaction: Transaction;
  /** Имя категории для показа (резолвит вызывающая сторона по categoryId). */
  categoryName?: string;
}

/** Форматирует сумму-строку в вид "1 000.50" без потери точности. */
function formatAmount(amount: string): string {
  const [intPart, fraction] = amount.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return fraction ? `${grouped}.${fraction}` : grouped;
}

export function TransactionItem({ transaction, categoryName }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const date = new Date(transaction.date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {transaction.description || (isIncome ? 'Доход' : 'Расход')}
        </p>
        <p className="text-muted-foreground text-xs">
          {date}
          {categoryName ? ` · ${categoryName}` : ''}
        </p>
      </div>
      <span
        className={cn(
          'shrink-0 text-sm font-semibold tabular-nums',
          isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
        )}
      >
        {isIncome ? '+' : '−'}
        {formatAmount(transaction.amount)}
      </span>
    </div>
  );
}
