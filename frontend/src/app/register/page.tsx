import type { Metadata } from 'next';

import { RegisterView } from '@/views/register';

export const metadata: Metadata = {
  title: 'Регистрация — Трекер расходов',
};

export default function RegisterPage() {
  return <RegisterView />;
}
