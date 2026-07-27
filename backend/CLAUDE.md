# todo_learn — backend (Nest.js)

Этот файл дополняет корневой `../CLAUDE.md` (он всегда подгружается) правилами,
специфичными для `backend/`. Загружается вместе с корневым, когда Claude Code
работает внутри этой директории.

## Структура модуля — CQRS

Backend-модули следуют CQRS-паттерну (`@nestjs/cqrs`): контроллер → сервис →
команды/запросы (`CommandBus`/`QueryBus`) → хендлеры (обращаются к Prisma). Образец —
`categories` (`backend/src/categories/`), тот же паттерн — в `transactions`.

- Контракты (команды, запросы, DTO-интерфейсы) лежат в `backend/src/contracts/` — общая папка,
  чтобы модули могли обращаться к чужим командам/запросам.
- **Изоляция по пользователю** — обязательна на уровне Prisma: `where: { id, userId }` в
  `updateMany`/`deleteMany`/`findFirst`, при `count === 0` → `NotFoundException`. Так чужие
  записи не видны и не изменяются. `userId` берётся из `@CurrentUser()` (декоратор в
  `auth/decorators/current-user.decorator.ts`, читает payload JWT), не из тела запроса.

## Деньги — Decimal

- **Денежные суммы — `Decimal(12,2)`**, наружу отдаются строкой (маппер `toTransactionDto`,
  `amount.toFixed(2)`). Арифметика — только методами `Prisma.Decimal` (`.minus`, `.toFixed`).
- `amount` в DTO принимается **строкой** с `@Matches(/^\d+(\.\d{1,2})?$/)`, не `@IsNumber` —
  иначе `ValidationPipe({transform:true})` привёл бы к float и потерял точность.

## Транзакции — фильтры и агрегаты

- **Итоги** `GET /transactions` — два `aggregate` по `type` (income/expense), `_sum.amount`
  при пустой группе `?? new Prisma.Decimal(0)`.
- **Фильтр month/year** — диапазон дат строится в **UTC** (`Date.UTC`), согласован с
  `<input type="date">` на фронте.
- Query-параметры month/year/limit/offset в DTO — с `@Type(() => Number)`, иначе не
  приведутся к числу.
- `GET /transactions/latest?limit=&offset=` — пагинация для дашборда (не описана в README).
  `limit` — `IsInt`, `1..100`, по умолчанию `10`; `offset` — `IsInt`, `>= 0`, по умолчанию `0`
  (дефолты применяются в контроллере через `Number(query.limit) || 10`, не в DTO).
  Сортировка — по дате, новые сверху (см. `transactions.service.ts`/`findLatest`).

## Авторизация — контракт

- JWT (`accessToken`), `passport-jwt` (`auth/strategies/jwt.strategy.ts`) +
  `JwtAuthGuard` на защищённых контроллерах.
- `POST /auth/register` (`name?`, `email`, `password` min 8) →
  `{ accessToken, user: { id, name, email } }`.
- `POST /auth/login` (`email`, `password` min 8) → тот же формат ответа.
- Фронтенд хранит и подставляет токен сам (`localStorage`, `authFetch`) — см.
  `frontend/CLAUDE.md`. Backend не должен полагаться на что-либо, кроме заголовка
  `Authorization: Bearer <token>`.

## Команды (только backend)

```bash
npm run dev:api        # start:dev -w backend, порт 3001
```

Полный список npm-скриптов монорепо — в корневом `CLAUDE.md`.
