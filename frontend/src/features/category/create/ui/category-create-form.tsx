'use client';

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
} from '@/shared/ui';
import {
  CategoryAppearancePicker,
  categoryFormSchema,
  createCategory,
  type CategoryFormValues,
} from '@/entities/category';

interface CategoryCreateFormProps {
  /** Вызывается после успешного создания — для обновления списка. */
  onCreated?: () => void;
}

export function CategoryCreateForm({ onCreated }: CategoryCreateFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', color: null, icon: null },
  });

  const color = form.watch('color');
  const icon = form.watch('icon');

  async function onSubmit(values: CategoryFormValues) {
    try {
      await createCategory({
        // При создании «не выбрано» — это undefined, а не null: поле просто не
        // уходит в теле запроса. null нужен только в PATCH, где он значит сброс.
        name: values.name.trim(),
        color: values.color ?? undefined,
        icon: values.icon ?? undefined,
      });
      toast.success('Категория создана');
      form.reset({ name: '', color: null, icon: null });
      onCreated?.();
    } catch (error) {
      // 409 от backend — имя уже занято; его текст показываем как есть.
      const message = error instanceof HttpError ? error.message : 'Не удалось создать категорию.';
      toast.error(message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input placeholder="Например: продукты" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CategoryAppearancePicker
          color={color}
          icon={icon}
          onColorChange={(value) => form.setValue('color', value, { shouldDirty: true })}
          onIconChange={(value) => form.setValue('icon', value, { shouldDirty: true })}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Сохранение…' : 'Добавить категорию'}
        </Button>
      </form>
    </Form>
  );
}
