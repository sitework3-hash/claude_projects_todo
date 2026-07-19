# todo_learn — трекер расходов

Учебный монорепозиторий: **Next.js** (frontend) + **Nest.js** (backend) + **Prisma/PostgreSQL**.

## Стек

| Слой      | Технология                          |
| --------- | ----------------------------------- |
| Монорепо  | npm workspaces                      |
| Frontend  | Next.js 16 (App Router), Tailwind 4 |
| Backend   | Nest.js 11                          |
| БД        | PostgreSQL 16 (Docker Compose)      |
| ORM       | Prisma 6 (`packages/database`)      |
| Качество  | ESLint 9 + Prettier                 |

## Структура

```
todo_learn/
├── frontend/          # Next.js 16
├── backend/           # Nest.js
└── packages/
    └── database/      # Prisma schema + client
```

## Возможности

- **Авторизация** — регистрация и вход по email/паролю (JWT).
- **Категории** — CRUD категорий доходов/расходов (с цветом и иконкой для UI).
- **Транзакции** — учёт доходов и расходов: создание, список за месяц/год с итогами
  (доход, расход, баланс), редактирование, удаление.

## Запуск

```bash
# 1. Секреты
cp .env.example .env        # при необходимости отредактировать

# 2. Установка зависимостей
npm install

# 3. Поднять PostgreSQL (нужен Docker)
docker compose up -d

# 4. Сгенерировать клиент и применить миграции
npm run db:generate
npm run db:migrate

# 5. Запустить dev-режим (backend + frontend)
npm run dev
```

Порты по умолчанию: backend — `3001`, frontend — `3000`, PostgreSQL — `5432`.

## Полезные скрипты

| Команда              | Действие                              |
| -------------------- | ------------------------------------- |
| `npm run dev:web`    | Запуск только frontend                |
| `npm run dev:api`    | Запуск только backend                 |
| `npm run lint`       | ESLint по всему репо                   |
| `npm run format`     | Prettier (запись)                     |
| `npm run db:studio`  | Prisma Studio                         |

## API

Все эндпоинты, кроме `/auth/*`, требуют заголовок `Authorization: Bearer <accessToken>`.

| Метод и путь              | Описание                                                   |
| ------------------------- | ---------------------------------------------------------- |
| `POST /auth/register`     | Регистрация (`name?`, `email`, `password` min 8) → токен   |
| `POST /auth/login`        | Вход (`email`, `password`) → токен                         |
| `GET /categories`         | Список категорий пользователя                              |
| `POST /categories`        | Создать категорию (`name`, `color?`, `icon?`)              |
| `PATCH /categories/:id`   | Обновить категорию                                         |
| `DELETE /categories/:id`  | Удалить категорию                                          |
| `GET /transactions`       | Список за период + итоги; фильтр `?month=1-12&year=YYYY`    |
| `POST /transactions`      | Создать (`amount`, `type` income/expense, `date?`, `description?`, `categoryId?`) |
| `GET /transactions/:id`   | Одна транзакция                                            |
| `PATCH /transactions/:id` | Обновить транзакцию                                        |
| `DELETE /transactions/:id`| Удалить транзакцию                                         |

Ответ `GET /transactions`:

```jsonc
{
  "transactions": [ /* ... отсортированы по дате, новые сверху */ ],
  "totals": { "income": "3000.00", "expense": "500.00", "balance": "2500.00" }
}
```

> **Денежные суммы — строки.** Prisma `Decimal` сериализуется в JSON строкой; так
> сохраняется точность. На клиенте суммы хранятся строкой и форматируются при показе.
