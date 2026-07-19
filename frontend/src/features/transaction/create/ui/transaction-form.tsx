'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { HttpError } from '@/shared/api';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { getCategories, type Category } from '@/entities/category';
import { createTransaction } from '@/entities/transaction';
import { createTransactionSchema, type CreateTransactionValues } from '../model/schema';

/** Сентинел «без категории» — Radix Select не допускает value="". */
const NO_CATEGORY = 'none';

interface TransactionFormProps {
  /** Вызывается после успешного создания (для обновления списка/итогов). */
  onCreated?: () => void;
}

export function TransactionForm({ onCreated }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<CreateTransactionValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: '',
      type: 'expense',
      description: '',
      date: '',
      categoryId: NO_CATEGORY,
    },
  });

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {
        // Категории не критичны для создания транзакции — молча пропускаем.
      });
  }, []);

  async function onSubmit(values: CreateTransactionValues) {
    try {
      await createTransaction({
        amount: values.amount,
        type: values.type,
        description: values.description?.trim() || undefined,
        date: values.date || undefined,
        categoryId:
          values.categoryId && values.categoryId !== NO_CATEGORY ? values.categoryId : undefined,
      });
      toast.success('Транзакция добавлена');
      form.reset({
        amount: '',
        type: values.type,
        description: '',
        date: '',
        categoryId: NO_CATEGORY,
      });
      onCreated?.();
    } catch (error) {
      const message =
        error instanceof HttpError ? error.message : 'Не удалось сохранить транзакцию.';
      toast.error(message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="expense">Расход</SelectItem>
                    <SelectItem value="income">Доход</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сумма</FormLabel>
                <FormControl>
                  <Input inputMode="decimal" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Категория</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Без категории" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>Без категории</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дата</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание (необязательно)</FormLabel>
              <FormControl>
                <Input placeholder="Например: продукты" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Сохранение…' : 'Добавить транзакцию'}
        </Button>
      </form>
    </Form>
  );
}
