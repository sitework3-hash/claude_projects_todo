// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      'packages/database/generated/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Next.js и Nest.js добавляют свои рекомендованные наборы
    // через собственные extends внутри frontend/ и backend/ при необходимости.
    rules: {},
  },
);
