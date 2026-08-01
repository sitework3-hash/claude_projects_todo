# todo_learn — трекер расходов

Учебный монорепозиторий: **Next.js** (frontend) + **Nest.js** (backend) + **Prisma/PostgreSQL**.

> Впервые в проекте? — [`docs/ONBOARDING.md`](docs/ONBOARDING.md): что здесь происходит,
> как запустить, как проверить и на какие грабли уже наступали.

## Стек

| Слой     | Технология                          |
| -------- | ----------------------------------- |
| Монорепо | npm workspaces                      |
| Frontend | Next.js 16 (App Router), Tailwind 4 |
| Backend  | Nest.js 11                          |
| БД       | PostgreSQL 16 (Docker Compose)      |
| ORM      | Prisma 6 (`packages/database`)      |
| Качество | ESLint 9 + Prettier                 |

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
- **Категории** — CRUD через API (имя, необязательные цвет и иконка для UI). Тип
  (доход/расход) хранится у транзакции, а не у категории. Страница категорий на
  фронтенде пока заглушка.
- **Транзакции** — учёт доходов и расходов: создание, список за месяц/год с итогами
  (доход, расход, баланс), лента последних операций с пагинацией, редактирование,
  удаление.

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

На машине с публичным IP фронтенд поднимать с явным биндом на localhost, иначе Next
слушает `0.0.0.0`:

```bash
npm run dev -w frontend -- -H 127.0.0.1 -p 3000
```

Проверить состояние миграций, ничего не меняя: `npm run db:migrate:status`.
`npm run db:migrate` (`prisma migrate dev`) на базе с данными выполнять осознанно —
при расхождении схемы Prisma предложит reset.

## Полезные скрипты

| Команда                     | Действие                                |
| --------------------------- | --------------------------------------- |
| `npm run dev:web`           | Запуск только frontend                  |
| `npm run dev:api`           | Запуск только backend                   |
| `npm run lint`              | ESLint по всему репо (это же гоняет CI) |
| `npm run build`             | Сборка backend + frontend               |
| `npm run format`            | Prettier (запись)                       |
| `npm run db:generate`       | Prisma Client                           |
| `npm run db:migrate`        | Применить миграции (dev)                |
| `npm run db:migrate:status` | Состояние миграций, без изменений       |
| `npm run db:studio`         | Prisma Studio                           |

## API

Все эндпоинты, кроме `/health` и `/auth/*`, требуют заголовок
`Authorization: Bearer <accessToken>`.

| Метод и путь               | Описание                                                                          |
| -------------------------- | --------------------------------------------------------------------------------- |
| `GET /health`              | Проверка живости (без авторизации)                                                |
| `POST /auth/register`      | Регистрация (`name?`, `email`, `password` min 8) → токен                          |
| `POST /auth/login`         | Вход (`email`, `password`) → токен                                                |
| `GET /categories`          | Список категорий пользователя                                                     |
| `POST /categories`         | Создать категорию (`name`, `color?`, `icon?`)                                     |
| `PATCH /categories/:id`    | Обновить категорию                                                                |
| `DELETE /categories/:id`   | Удалить категорию                                                                 |
| `GET /transactions`        | Список за период + итоги; фильтр `?month=1-12&year=YYYY`                          |
| `GET /transactions/latest` | Лента для дашборда: `?limit=1..100` (по умолчанию 10), `?offset=0`                |
| `POST /transactions`       | Создать (`amount`, `type` income/expense, `date?`, `description?`, `categoryId?`) |
| `GET /transactions/:id`    | Одна транзакция                                                                   |
| `PATCH /transactions/:id`  | Обновить транзакцию                                                               |
| `DELETE /transactions/:id` | Удалить транзакцию                                                                |

Ответ `GET /transactions`:

```jsonc
{
  "transactions": [/* ... отсортированы по дате, новые сверху */],
  "totals": { "income": "3000.00", "expense": "500.00", "balance": "2500.00" },
}
```

> **Денежные суммы — строки.** Prisma `Decimal` сериализуется в JSON строкой; так
> сохраняется точность. На клиенте суммы хранятся строкой и форматируются при показе.
