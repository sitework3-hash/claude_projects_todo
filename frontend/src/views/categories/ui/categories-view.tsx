'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { HttpError } from '@/shared/api';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { useSession } from '@/entities/session';
import { CategoryBadge, deleteCategory, getCategories, type Category } from '@/entities/category';
import { CategoryCreateForm } from '@/features/category/create';
import { CategoryEditForm } from '@/features/category/edit';

export function CategoriesView() {
  const router = useRouter();
  const { user, isLoading: sessionLoading } = useSession();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  /** id категории, для которой показано подтверждение удаления. */
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Приватная страница: без сессии — на логин.
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.replace('/login');
    }
  }, [sessionLoading, user, router]);

  const loadCategories = useCallback(() => {
    return getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (user) loadCategories();
  }, [user, loadCategories]);

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id);
      toast.success('Категория удалена');
      setConfirmingId(null);
      await loadCategories();
    } catch (error) {
      const message = error instanceof HttpError ? error.message : 'Не удалось удалить категорию.';
      toast.error(message);
    }
  }

  if (sessionLoading || !user) {
    return null;
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Категории</h1>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">На главную</Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Новая категория</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryCreateForm onCreated={loadCategories} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <p className="text-muted-foreground py-8 text-center text-sm">Загрузка…</p>
        ) : categories.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Категорий пока нет — создайте первую в форме выше
          </p>
        ) : (
          categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                {editingId === category.id ? (
                  <CategoryEditForm
                    category={category}
                    onSaved={() => {
                      setEditingId(null);
                      loadCategories();
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <CategoryBadge category={category} />

                    {confirmingId === category.id ? (
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(category.id)}
                        >
                          Удалить
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmingId(null)}>
                          Отмена
                        </Button>
                      </div>
                    ) : (
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(category.id);
                            setConfirmingId(null);
                          }}
                        >
                          Изменить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmingId(category.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {categories.length > 0 ? (
        <p className="text-muted-foreground text-center text-xs">
          Удаление категории не удаляет транзакции — они останутся без категории.
        </p>
      ) : null}
    </main>
  );
}
