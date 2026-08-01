import {
  Car,
  Coffee,
  Dumbbell,
  Film,
  Gift,
  Heart,
  Home,
  Plane,
  ShoppingCart,
  Smartphone,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/**
 * Палитра цветов категории. Значения — hex из 6 знаков: backend валидирует
 * `color` регуляркой /^#[0-9A-Fa-f]{6}$/, короткая форма (#fff) не пройдёт.
 */
export const CATEGORY_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
] as const;

/**
 * Допустимые иконки. В базе хранится имя (`icon`), а не сам компонент, поэтому
 * набор фиксирован: рендерить произвольное имя из lucide пришлось бы динамическим
 * импортом всей библиотеки.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Heart,
  Gift,
  Plane,
  Coffee,
  Smartphone,
  Wallet,
  Film,
  Dumbbell,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

/** Компонент иконки по имени из базы; null, если имя пустое или неизвестное. */
export function resolveCategoryIcon(name: string | null): LucideIcon | null {
  if (!name) return null;
  return CATEGORY_ICONS[name] ?? null;
}
