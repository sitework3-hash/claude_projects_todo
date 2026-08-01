import type { Metadata } from 'next';

import { CategoriesView } from '@/views/categories';

export const metadata: Metadata = {
  title: 'Категории — Трекер расходов',
};

export default function CategoriesPage() {
  return <CategoriesView />;
}
