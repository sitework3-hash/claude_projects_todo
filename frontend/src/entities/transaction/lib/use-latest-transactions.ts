'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getLatestTransactions } from '../api/get-latest-transactions';
import type { Transaction } from '../model/types';

const PAGE_SIZE = 10;

interface UseLatestTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

/** Загрузка последних транзакций с пагинацией. */
export function useLatestTransactions(): UseLatestTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback((currentOffset: number) => {
    getLatestTransactions({ limit: PAGE_SIZE, offset: currentOffset })
      .then((data) => {
        setTransactions((prev) =>
          currentOffset === 0 ? data : [...prev, ...data],
        );
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch(() => {
        // При ошибке показываем toast только для последующих загрузок
        if (currentOffset > 0) {
          toast.error('Не удалось загрузить транзакции. Попробуйте ещё раз.');
        } else {
          // При первой загрузке просто очищаем
          setTransactions([]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const loadMore = useCallback(() => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    loadPage(nextOffset);
  }, [offset, loadPage]);

  // Первичная загрузка
  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  return { transactions, loading, hasMore, loadMore };
}
