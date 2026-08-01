---
name: run-app
description: Use when the user wants to run, start, launch or smoke-test the todo_learn app locally (запусти приложение, подними бэкенд/фронтенд, проверь что работает) — brings up PostgreSQL, backend (3001) and frontend (3000), then verifies auth and transactions end-to-end. Manual invocation only (/run-app).
disable-model-invocation: true
allowedTools:
  - Bash(npm *)
  - Bash(docker *)
  - Bash(curl *)
  - Bash(ss *)
  - Bash(tail *)
  - Bash(grep *)
  - Read
argument-hint: [api|web|all]
model: sonnet
effort: medium
---

# Run App

## Overview

Поднимает `todo_learn` локально и проверяет, что приложение действительно работает, а
не просто «процесс стартовал». Последовательность проверена вживую — не изобретать
заново и не заменять запуск сборкой или тестами.

Аргумент (`$1`, необязательный): `api` — только backend, `web` — только frontend,
`all` или пусто — всё целиком.

Что за проект и где что лежит — `docs/ONBOARDING.md`. Здесь только запуск.

## Порядок действий

### 1. Проверить, не запущено ли уже

```bash
ss -ltn | grep -E ':(3000|3001|5432)'
```

- `3001` занят → backend уже поднят, второй раз не запускать (получишь
  `EADDRINUSE`). То же для `3000`.
- Nest стартует в режиме `--watch`: после правки исходников он **сам** пересоберётся
  и перезапустится. Не перезапускать вручную.

### 2. База

```bash
docker ps --filter name=todo_learn_db --format '{{.Names}} {{.Status}}'
```

Пусто → `docker compose up -d db` и дождаться `healthy`. Контейнер не удалять и
`docker compose down -v` не выполнять — потеряются данные.

Схема БД:

```bash
npm run db:generate
npm run db:migrate:status     # ожидаем «Database schema is up to date!»
```

`npm run db:migrate` (то есть `prisma migrate dev`) на живой базе **не запускать**
без явной просьбы: при расхождении схемы Prisma предложит reset с потерей данных.

### 3. Backend (порт 3001)

```bash
npm run dev:api > /tmp/api.log 2>&1 &
```

Дождаться готовности и убедиться, что не упал:

```bash
until grep -qE 'Nest application successfully started|ERROR|error TS' /tmp/api.log; do sleep 2; done
tail -5 /tmp/api.log
```

Ждать нужно именно так — компиляция занимает 20–60 секунд, и падение тоже приходит
в лог, а не в exit code фонового процесса.

### 4. Frontend (порт 3000)

На машине с публичным IP биндить **явно на localhost**, иначе Next слушает `0.0.0.0`
и страница видна из интернета:

```bash
npm run dev -w frontend -- -H 127.0.0.1 -p 3000 > /tmp/web.log 2>&1 &
until grep -qE 'Ready in|Error' /tmp/web.log; do sleep 1; done
```

Не экспортировать корневой `.env` в окружение перед запуском фронта: там `PORT=3001`
для бэкенда, Next его подхватит и займёт чужой порт.

### 5. Смоук-проверка (обязательна)

Запуск без проверки не считается выполненной задачей. Прогнать сценарий целиком:

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
  -d "{\"amount\":\"1250.50\",\"type\":\"expense\",\"categoryId\":\"$CATID\"}"

curl -s localhost:3001/transactions -H "Authorization: Bearer $TOKEN"
curl -s -o /dev/null -w '%{http_code}\n' localhost:3001/transactions
```

Ожидаемо: суммы приходят **строками** (`"1250.50"`), `totals.balance` — `"-1250.50"`,
запрос без токена — `401`.

Фронтенд: `curl -s -o /dev/null -w '%{http_code}' localhost:3000/` → `200`.

### 6. Проверить UI, если менялся фронтенд

Скриншот и клики — через Playwright (установлен глобально, `python3` + `chromium`):
дойти до формы входа, залогиниться созданным аккаунтом, снять скриншот и **посмотреть
на него**. Пустой кадр — это провал запуска, а не успех.

Форма входа — на shadcn/ui: настоящий `input[type=checkbox]` скрыт под оформлением,
кликать по `role="checkbox"`, иначе Playwright упрётся в «element intercepts pointer
events».

### 7. Отчитаться

Сообщить: что поднято и на каких портах, результат смоук-проверки, что видно в UI.
Серверы оставить работать, если пользователь не просил погасить, и указать пути к
логам.

## Типовые сбои

| Симптом                                                | Причина и что делать                                                                                                          |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `JwtStrategy requires a secret or key`                 | `JWT_SECRET` не найден. Проверить `envFilePath: ['../.env', '.env']` в `backend/src/app.module.ts` и наличие корневого `.env` |
| `P1012: Environment variable not found: DATABASE_URL`  | Prisma-скрипт вызван без обёртки, подгружающей корневой `.env` — см. `packages/database/package.json`                         |
| `EADDRINUSE :3001`                                     | Backend уже запущен (в том числе watch-процессом из прошлого запуска) — не поднимать второй                                   |
| Фронт открылся, но данные не грузятся, в консоли `401` | Один `401` на первом рендере до появления токена — норма. Постоянные `401` → протух токен в `localStorage`                    |
| Next слушает `0.0.0.0`                                 | Забыт `-H 127.0.0.1`                                                                                                          |
