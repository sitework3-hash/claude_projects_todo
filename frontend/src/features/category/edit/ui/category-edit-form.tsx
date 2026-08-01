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
  updateCategory,
  type Category,
  type CategoryFormValues,
} from '@/entities/category';

interface CategoryEditFormProps {
  category: Category;
  /** Вызывается после успешного сохранения — для обновления списка. */
  onSaved?: () => void;
  onCancel?: () => void;
}

export function CategoryEditForm({ category, onSaved, onCancel }: CategoryEditFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category.name,
      color: category.color,
      icon: category.icon,
    },
  });

  const color = form.watch('color');
  const icon = form.watch('icon');

  async function onSubmit(values: CategoryFormValues) {
    try {
      await updateCategory(category.id, {
        name: values.name.trim(),
        color: values.color,
        icon: values.icon,
      });
      toast.success('Категория обновлена');
      onSaved?.();
    } catch (error) {
      // 409 — имя занято другой категорией, 404 — категория уже удалена.
      const message =
        error instanceof HttpError ? error.message : 'Не удалось сохранить категорию.';
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
                <Input autoFocus {...field} />
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

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Сохранение…' : 'Сохранить'}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
