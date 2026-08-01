import { resolveCategoryIcon } from '../config/appearance';
import type { Category } from '../model/types';

interface CategoryBadgeProps {
  category: Category;
}

/** Кружок с цветом и иконкой категории + её название. */
export function CategoryBadge({ category }: CategoryBadgeProps) {
  const Icon = resolveCategoryIcon(category.icon);

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full"
        // Цвет приходит из базы, поэтому только инлайн-стиль: Tailwind не умеет
        // генерировать классы под произвольные значения во время выполнения.
        style={{ backgroundColor: category.color ?? 'var(--muted)' }}
      >
        {Icon ? <Icon className="size-4 text-white" aria-hidden /> : null}
      </span>
      <span className="truncate font-medium">{category.name}</span>
    </span>
  );
}
