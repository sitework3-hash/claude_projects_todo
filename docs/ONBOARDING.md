# Онбординг: todo_learn за 5 минут

Точка входа для того, кто открыл репозиторий впервые (человек или агент).
Цель файла — чтобы не пришлось перечитывать код, чтобы понять, что здесь происходит
и как это запустить.

Порядок чтения: **этот файл → `CLAUDE.md` (правила работы) → `backend/CLAUDE.md`
или `frontend/CLAUDE.md` (детали слоя, только когда работаешь внутри него)**.

---

## 1. Что это за проект

**Учебный трекер личных расходов.** Пользователь регистрируется, заводит категории и
записывает доходы/расходы; приложение показывает список операций за период и итоги
(доход, расход, баланс).

Проект учебный — приоритет у понятности кода и следования канонам (CQRS на бэкенде,
Feature-Sliced Design на фронте), а не у продуктовой полноты.

| Слой     | Технология                                                          |
| -------- | ------------------------------------------------------------------- |
| Монорепо | npm workspaces (`frontend`, `backend`, `packages/*`)                |
| Frontend | Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, shadcn/ui |
| Backend  | Nest.js 11, CQRS (`@nestjs/cqrs`), passport-jwt                     |
| БД       | PostgreSQL 16 в Docker Compose                                      |
| ORM      | Prisma 6 (`packages/database`)                                      |
| Качество | ESLint 9 + Prettier, CI на GitHub Actions (lint + build)            |

Node — **22+** (задано в `engines`).

## 2. Карта репозитория

```
todo_learn/
├── backend/            # Nest.js API (порт 3001)
│   └── src/
│       ├── auth/            # регистрация, вход, JWT-стратегия, guard
│       ├── users/           # CQRS-хендлеры пользователя
│       ├── categories/      # CRUD категорий
│       ├── transactions/    # ядро: операции + агрегаты
│       ├── contracts/       # команды, запросы, DTO-интерфейсы (общие для модулей)
│       └── main.ts          # bootstrap: CORS, ValidationPipe, порт
├── frontend/           # Next.js (порт 3000), архитектура FSD
│   └── src/{app,views,features,entities,shared}
├── packages/database/  # Prisma schema, миграции, сгенерированный клиент
├── docs/               # этот файл и прочая документация
├── .claude/skills/     # проектные скиллы Claude Code (см. §8)
├── prompts/, templates/  # учебные ТЗ и шаблон постановки задачи
└── docker-compose.yml  # PostgreSQL
```

## 3. Модель данных

`packages/database/prisma/schema.prisma`, три модели:

- **User** — `email` (уникальный), `name?`, `passwordHash` (bcrypt).
- **Category** — `name`, `color?`, `icon?`, привязана к пользователю,
  `@@unique([userId, name])`. **Типа (доход/расход) у категории нет** — тип живёт
  у транзакции.
- **Transaction** — `amount` (`Decimal(12,2)`), `type` (`income` | `expense`),
  `description?`, `date`, `categoryId?` (необязательна, при удалении категории →
  `SetNull`), `userId`.

Удаление пользователя каскадно удаляет его категории и транзакции.

> **Деньги — всегда `Decimal`, наружу отдаются строкой** (`"1250.50"`). Не приводить к
> `number` ни на бэке, ни на фронте — потеряется точность. Подробности — в
> `backend/CLAUDE.md`.

## 4. Запуск (проверено)

Готовый сценарий с проверками — в скилле `.claude/skills/run-app/SKILL.md`
(вызов: `/run-app`). Ниже — то же самое вручную.

```bash
# 0. Зависимости (один раз)
npm install

# 1. База
docker compose up -d db
docker ps --filter name=todo_learn_db     # ожидаем healthy

# 2. Prisma-клиент и состояние миграций
npm run db:generate
npm run db:migrate:status                  # «Database schema is up to date!»

# 3. Backend (порт 3001)
npm run dev:api

# 4. Frontend (порт 3000) — в отдельном окне
npm run dev:web
```

**На сервере с публичным IP** фронт поднимать с явным биндом на localhost, иначе
Next слушает `0.0.0.0` и страница доступна снаружи:

```bash
npm run dev -w frontend -- -H 127.0.0.1 -p 3000
```

Смотреть с ноутбука — через SSH-туннель (`ssh -L 3000:127.0.0.1:3000 …`), наружу
порты не открывать.

`npm run dev` в корне запускает оба процесса разом (`dev:api & dev:web`), но логи
смешиваются — для отладки лучше два отдельных окна.

## 5. Как убедиться, что всё работает

Смоук-проверка API целиком (регистрация → категория → транзакция → итоги):

```bash
curl -s localhost:3001/health

EMAIL="smoke-$(date +%s)@example.com"
TOKEN=$(curl -s -X POST localhost:3001/auth/register \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Smoke\",\"email\":\"$EMAIL\",\"password\":\"password123\"}" \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

CAT=$(curl -s -X POST localhost:3001/categories -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"name":"Продукты"}')
CATID=$(echo "$CAT" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

curl -s -X POST localhost:3001/transactions -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"amount\":\"1250.50\",\"type\":\"expense\",\"categoryId\":\"$CATID\",\"date\":\"2026-08-01\"}"

curl -s localhost:3001/transactions -H "Authorization: Bearer $TOKEN"
# ожидаем totals: expense "1250.50", balance "-1250.50"

curl -s -o /dev/null -w '%{http_code}\n' localhost:3001/transactions   # 401 без токена
```

Фронтенд: открыть `http://localhost:3000`, войти созданным аккаунтом — на дашборде
появится операция в блоке «Последние транзакции».

Проверка кода:

```bash
npm run lint            # ESLint по всему репо (это же гоняет CI)
npm run build           # сборка backend + frontend
npm run format:check    # Prettier
```

Данные глазами: `npm run db:studio` (Prisma Studio).

## 6. API

Все эндпоинты, кроме `/health` и `/auth/*`, требуют `Authorization: Bearer <accessToken>`.
Ответ на ошибку — формат Nest: `{ "message": string | string[], ... }`.

| Метод и путь               | Описание                                                                   |
| -------------------------- | -------------------------------------------------------------------------- |
| `GET /health`              | Проверка живости (без авторизации)                                         |
| `POST /auth/register`      | `name?`, `email`, `password` (min 8) → `{ accessToken, user }`             |
| `POST /auth/login`         | `email`, `password` → `{ accessToken, user }`                              |
| `GET /categories`          | Категории пользователя                                                     |
| `POST /categories`         | Создать (`name`, `color?`, `icon?`)                                        |
| `PATCH /categories/:id`    | Обновить                                                                   |
| `DELETE /categories/:id`   | Удалить                                                                    |
| `GET /transactions`        | Список + итоги; фильтр `?month=1-12&year=YYYY`, `limit`, `offset`          |
| `GET /transactions/latest` | Лента для дашборда: `?limit=1..100` (10), `?offset=0`                      |
| `POST /transactions`       | Создать (`amount` строкой, `type`, `date?`, `description?`, `categoryId?`) |
| `GET /transactions/:id`    | Одна операция                                                              |
| `PATCH /transactions/:id`  | Обновить                                                                   |
| `DELETE /transactions/:id` | Удалить                                                                    |

Ответ `GET /transactions`:

```jsonc
{
  "transactions": [/* новые сверху */],
  "totals": { "income": "3000.00", "expense": "500.00", "balance": "2500.00" },
}
```

**Изоляция по пользователю** обязательна на уровне Prisma (`where: { id, userId }`),
`userId` берётся из JWT через `@CurrentUser()`, никогда из тела запроса.

## 7. Грабли (проверено на практике)

1. **`.env` лежит в корне монорепо, а процессы стартуют из своих папок.**
   Для Nest это решено явным `envFilePath: ['../.env', '.env']` в `app.module.ts`;
   для Prisma — обёрткой в скриптах `packages/database/package.json`, которая
   подгружает корневой `.env` перед вызовом CLI. Если добавляешь новый скрипт,
   работающий с БД, — не забудь ту же обёртку, иначе получишь
   `P1012: Environment variable not found: DATABASE_URL`.
2. **`PORT=3001` из `.env` предназначен бэкенду.** Если экспортировать `.env` в
   окружение и запустить фронт, Next тоже увидит `PORT=3001`, займёт порт первым и
   бэкенд не поднимется. Фронту порт задавать явно.
3. **Next 16 удалил `next lint`.** Линт фронта — обычный `eslint` (скрипт уже
   исправлен). Не возвращать `next lint`.
4. **React StrictMode в dev вызывает эффекты дважды.** Поэтому в
   `use-latest-transactions.ts` первая страница (`offset === 0`) **заменяет** список,
   а не дописывается — иначе записи задваиваются.
5. **Даты фильтра month/year считаются в UTC** (`Date.UTC`) — согласовано с
   `<input type="date">` на фронте.
6. **Скиллу `standup` дата нужна по Москве**, а сервер живёт в другом поясе — там
   явные границы суток со смещением `+0300`.

## 8. Проектные скиллы Claude Code

Лежат в `.claude/skills/`, вызываются вручную как `/<имя>`:

| Скилл       | Зачем                                                     |
| ----------- | --------------------------------------------------------- |
| `run-app`   | Поднять БД + backend + frontend и прогнать смоук-проверки |
| `commit`    | Коммит по Conventional Commits с описанием на русском     |
| `create-pr` | Запушить ветку и открыть PR в `main` по шаблону проекта   |
| `add-tests` | Написать юнит-тесты для указанного файла                  |
| `standup`   | Отчёт по вчерашним коммитам (по московскому времени)      |

Memory проекта — в `.claude/memory/` (gitignored), читать `MEMORY.md` в начале работы.

## 9. Что уже сделано и чего нет

Сделано: авторизация (JWT), категории (CRUD на API), транзакции (CRUD, фильтр по
месяцу/году, итоги, лента с пагинацией), дашборд и страница транзакций на фронте.

Не сделано — учитывать, прежде чем «чинить»:

- **Тестов нет ни одного.** CI гоняет только lint + build. Для новых тестов есть
  скилл `add-tests` — он поднимет раннер с нуля.
- **Страница категорий на фронте — заглушка** («Раздел в разработке»), хотя API
  категорий полный.
- **Swagger не подключён** — контракт описан только здесь и в `backend/CLAUDE.md`.
- **Backend слушает `0.0.0.0`** (`app.listen(port)` без адреса). На публичной машине
  единственный рубеж — файрвол.
- Токен хранится в `localStorage` — осознанное учебное упрощение (риск XSS).

## 10. Правила работы с репозиторием

Ветка `main` защищена процессом: только PR, никаких прямых пушей. Ветки —
`feature/`, `fix/`, `hotfix/`; коммиты — Conventional Commits с русским описанием.
Полностью — в корневом `CLAUDE.md` (раздел «Git Flow»).
