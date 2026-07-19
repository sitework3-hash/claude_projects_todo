# План: авторизация через JWT + модули Users и Auth (CQRS)

## Чек-лист задач

- [x] **1. Prisma.** Добавить `passwordHash String` в модель `User` (`packages/database/prisma/schema.prisma`)
- [x] **2. Зависимости.** `@nestjs/cqrs`, `@nestjs/jwt`, `bcryptjs`, `@types/bcryptjs`, `class-validator`, `class-transformer` в `backend/package.json`
- [x] **3. Контракты.** `src/contracts/`: `CreateUserCommand`, `GetUserByEmailQuery`, `PublicUser`/`UserWithHash`
- [x] **4. Модуль Users.** `CreateUserHandler`, `GetUserByEmailHandler`, `users.module.ts`
- [x] **5. Модуль Auth.** DTO, `AuthService` (bcrypt + bus + JWT), `AuthController`, `auth.module.ts`
- [x] **6. Сборка.** `app.module.ts` (CqrsModule, Users, Auth) + глобальный `ValidationPipe` в `main.ts`
- [x] **7. Конфиг.** `JWT_SECRET`, `JWT_EXPIRES_IN` в `.env.example`
- [x] **8. Проверка.** install → БД → миграции → register/login end-to-end → lint

---

## Контекст

Бэкенд (`backend/`) — свежий скелет Nest.js 11: есть только `AppModule` / `AppController`
(`/health`). Нужно добавить авторизацию:

- **Модуль пользователя** — поля `name`, `email`, `passwordHash`.
- **Модуль авторизации** через JWT — методы `register` и `login`.
- Взаимодействие между модулями **через CQRS**, без прямых импортов сервисов: Auth не
  импортирует `UsersService`, а шлёт команды/запросы через `CommandBus`/`QueryBus`; Users
  регистрирует обработчики. Классы-контракты живут в общей папке `src/contracts/`, поэтому
  ни один модуль не зависит от внутренностей другого.

Prisma-модель `User` уже содержит `email` (unique) и `name?`, но **нет `passwordHash`**.
Prisma-клиент — общий синглтон из `@todo-learn/database` (`packages/database/index.ts`).
Хэширование — **bcryptjs** (чистый JS, без нативной сборки — важно на этом VPS). Guard и
защищённые маршруты в этот этап **не входят** (добавим позже).

## Взаимодействие модулей через CQRS (ключевая часть)

Auth **не импортирует** `UsersService` и не вызывает его методы. Всё общение идёт через шину
Nest CQRS: Auth **отправляет** команду/запрос, Users **обрабатывает** их. Единственное, что
знают оба модуля — общие классы-контракты из `src/contracts/` (это данные, а не реализация).

```
┌────────────────────────── AuthModule ──────────────────────────┐
│ AuthController → AuthService                                     │
│   register(dto):                                                 │
│     hash = bcrypt.hash(dto.password)                             │
│     user = await commandBus.execute(                            ─┼──┐  команда
│               new CreateUserCommand(name, email, hash))          │  │
│     return signToken(user)                                       │  │
│   login(dto):                                                    │  │
│     user = await queryBus.execute(                              ─┼──┼─┐ запрос
│               new GetUserByEmailQuery(email))                    │  │ │
│     bcrypt.compare(...) → signToken(user)                        │  │ │
└─────────────────────────────────────────────────────────────────┘  │ │
                                                                       │ │
          src/contracts/ (общие классы, импортируют оба модуля)       │ │
          CreateUserCommand · GetUserByEmailQuery · PublicUser         │ │
                                                                       │ │
┌────────────────────────── UsersModule ─────────────────────────┐   │ │
│  @CommandHandler(CreateUserCommand)  CreateUserHandler  ◄────────┼───┘ │
│      prisma.user.create(...) → PublicUser                        │     │
│  @QueryHandler(GetUserByEmailQuery)  GetUserByEmailHandler ◄─────┼─────┘
│      prisma.user.findUnique(...) → UserWithHash | null           │
└─────────────────────────────────────────────────────────────────┘
```

Границы развязки:

- **Компайл-тайм:** `auth/*` импортирует только `src/contracts/*` и `@nestjs/cqrs`/`@nestjs/jwt`.
  Ни одного `import ... from '../users/...'`. Обратно — тоже: `users/*` не знает про Auth.
- **Рантайм:** `CommandBus`/`QueryBus` находят нужный хендлер по классу команды/запроса
  (реестр `@nestjs/cqrs`), а не по ссылке на провайдер. Поэтому реализацию Users можно
  менять/выносить в другой модуль, не трогая Auth.
- **Команда vs запрос:** `CreateUserCommand` меняет состояние (пишет в БД); `GetUserByEmailQuery`
  только читает — это и есть разделение C/Q в CQRS.
- **Контракт возврата:** хендлеры возвращают значение через `bus.execute(...)` (в `@nestjs/cqrs`
  `execute` резолвит результат хендлера) — Auth получает `PublicUser` / `UserWithHash`, не
  обращаясь к Prisma напрямую.
- **Регистрация:** оба модуля импортируют `CqrsModule`; хендлеры Users перечислены в его
  `providers` — этого достаточно, чтобы шина их подхватила глобально.

## Шаг 1. Схема БД

`packages/database/prisma/schema.prisma` — в модель `User` добавить обязательное поле:

```prisma
passwordHash String
```

Данных в БД нет (проект учебный), поле делаем `NOT NULL`. Затем миграция (см. «Проверка»).

## Шаг 2. Зависимости

В `backend/package.json` добавить и установить:

- `@nestjs/cqrs` — CommandBus/QueryBus/обработчики
- `@nestjs/jwt` — подпись/проверка JWT
- `bcryptjs` + `@types/bcryptjs` — хэш паролей
- `class-validator` + `class-transformer` — валидация DTO через глобальный `ValidationPipe`

## Шаг 3. Общие контракты — `backend/src/contracts/`

Плоские классы-контракты, которые импортируют оба модуля (это DTO/маркеры, не реализация):

- `create-user.command.ts` — `class CreateUserCommand { constructor(name, email, passwordHash) }`
- `get-user-by-email.query.ts` — `class GetUserByEmailQuery { constructor(email) }`
- `user.dto.ts`:
  - `PublicUser` = `{ id, name, email }` (никогда не отдаём `passwordHash` клиенту)
  - `UserWithHash` = `PublicUser & { passwordHash }` (только для проверки пароля в login)

## Шаг 4. Модуль Users — `backend/src/users/` (владелец данных)

- `users/commands/create-user.handler.ts` — `@CommandHandler(CreateUserCommand)`:
  создаёт пользователя через `prisma.user.create`, возвращает `PublicUser`. Prisma-ошибку
  уникальности email (`P2002`) → `ConflictException`.
- `users/queries/get-user-by-email.handler.ts` — `@QueryHandler(GetUserByEmailQuery)`:
  `prisma.user.findUnique({ where: { email } })`, возвращает `UserWithHash | null`.
- `users.module.ts` — регистрирует оба хендлера в `providers`, импортирует `CqrsModule`.
- Prisma берём из `@todo-learn/database` (существующий синглтон), напрямую в хендлерах —
  как в текущем паттерне проекта.

## Шаг 5. Модуль Auth — `backend/src/auth/` (JWT)

- `auth/dto/register.dto.ts` — `name` (string, optional), `email` (`@IsEmail`),
  `password` (`@MinLength(8)`); `auth/dto/login.dto.ts` — `email`, `password`.
- `auth.service.ts`:
  - `register(dto)`: `bcrypt.hash(password)` → `commandBus.execute(new CreateUserCommand(...))`
    → `signToken(user)`. Возвращает `{ accessToken, user: PublicUser }`.
  - `login(dto)`: `queryBus.execute(new GetUserByEmailQuery(email))` → если нет пользователя
    или `bcrypt.compare` не сошёлся → `UnauthorizedException` → иначе `signToken`.
  - `signToken`: payload `{ sub: id, email }`, `jwtService.signAsync`.
- `auth.controller.ts` — `@Controller('auth')`: `POST /auth/register`, `POST /auth/login`.
- `auth.module.ts` — импортирует `CqrsModule` и `JwtModule.registerAsync` (секрет и срок
  из `ConfigService`: `JWT_SECRET`, `JWT_EXPIRES_IN`).

## Шаг 6. Сборка приложения

- `app.module.ts` — добавить в `imports`: `CqrsModule.forRoot()` (или per-module), `UsersModule`,
  `AuthModule`. `ConfigModule` уже глобальный.
- `main.ts` — добавить `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`.

## Шаг 7. Конфигурация

`.env.example` — добавить:

```
JWT_SECRET=change-me-dev-secret
JWT_EXPIRES_IN=1d
```

## Проверка (end-to-end)

1. `npm install` в корне монорепо (deps ещё не установлены; следить за RAM — 3.8 ГБ).
2. Поднять БД: `docker compose up -d` (Docker нужен; если недоступен — предупредить владельца).
3. `npm run db:generate` и `npm run db:migrate` (создаст миграцию с `passwordHash`).
4. `npm run dev:api` — проверить `GET /health` (регресс).
5. `curl -X POST localhost:3001/auth/register -H 'content-type: application/json'
   -d '{"name":"Max","email":"max@example.com","password":"secret123"}'`
   → ожидаем `201` + `{ accessToken, user }`, в ответе нет `passwordHash`.
6. Повтор register с тем же email → `409 Conflict`.
7. `POST /auth/login` с верным паролем → `200` + `accessToken`; с неверным → `401`.
8. (Опц.) декодировать JWT на jwt.io — проверить payload `{ sub, email }`.
9. `npm run lint` — чисто.

## Примечания

- Guard/`passport-jwt`/`/auth/me` не делаем сейчас — контракт JWT (`{ sub, email }`) заложен,
  чтобы добавить их без переделок.
- Секреты (`JWT_SECRET`) — только в `.env`, в репозиторий не коммитим (в `.env.example` — заглушка).
