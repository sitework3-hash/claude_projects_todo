'use client';

import { cn } from '@/shared/lib/utils';
import { CATEGORY_COLORS, CATEGORY_ICON_NAMES, resolveCategoryIcon } from '../config/appearance';

interface CategoryAppearancePickerProps {
  color: string | null;
  icon: string | null;
  onColorChange: (color: string | null) => void;
  onIconChange: (icon: string | null) => void;
}

/**
 * Выбор цвета и иконки — общий для форм создания и редактирования, поэтому лежит
 * в entities: feature-слайсы не могут импортировать друг друга (FSD).
 *
 * Палитра кнопками, а не <input type="color">: набор значений заведомо проходит
 * валидацию backend, и повторный клик снимает выбор (null = «без цвета»).
 */
export function CategoryAppearancePicker({
  color,
  icon,
  onColorChange,
  onIconChange,
}: CategoryAppearancePickerProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <span className="text-sm font-medium">Цвет</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`Цвет ${value}`}
              aria-pressed={color === value}
              onClick={() => onColorChange(color === value ? null : value)}
              className={cn(
                'size-7 rounded-full transition-transform',
                color === value
                  ? 'ring-foreground scale-110 ring-2 ring-offset-2'
                  : 'hover:scale-110',
              )}
              style={{ backgroundColor: value }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium">Иконка</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ICON_NAMES.map((name) => {
            const Icon = resolveCategoryIcon(name);
            if (!Icon) return null;
            const selected = icon === name;

            return (
              <button
                key={name}
                type="button"
                aria-label={`Иконка ${name}`}
                aria-pressed={selected}
                onClick={() => onIconChange(selected ? null : name)}
                className={cn(
                  'flex size-9 items-center justify-center rounded-md border transition-colors',
                  selected ? 'border-foreground bg-accent' : 'border-input hover:bg-accent/50',
                )}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
