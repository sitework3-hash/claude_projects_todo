# План: модуль «Категории трат» (Categories)

## Контекст

Проект `todo_learn` — монорепо NestJS 11 + Prisma/Postgres + `@nestjs/cqrs`. Авторизация уже
реализована: `AuthService` общается с User-модулем по CQRS (`CreateUserCommand`,
`GetUserByEmailQuery`) и выдаёт JWT c payload `{ sub: userId, email }`.

Нужен CRUD категорий трат, привязанных к пользователю. Модель `Category` в Prisma **уже есть**
(`id, name, color, userId`, `@@unique([userId, name])`), но:
- нет поля `icon` (требуется по ТЗ);
- нет JWT-гарда (эндпоинты не защищены; `@nestjs/jwt` используется только для подписи);
- User-модуль не умеет отдавать пользователя по `id`.

**Согласованные решения:**
- JWT-гард: `@nestjs/passport` + `passport-jwt` (`JwtStrategy` + `AuthGuard('jwt')`).
- User↔CQRS: добавить `GetUserByIdQuery`; `CategoriesService.create` проверяет владельца через `QueryBus`.
- Миграцию Prisma выполнять (нужен поднятый Postgres из docker-compose).

---

## Чек-лист задач

### 1. Схема БД и миграция
- [ ] В `packages/database/prisma/schema.prisma` в модель `Category` добавить `icon String?`.
- [ ] Поднять БД: `docker compose up -d db`.
- [ ] `npm run db:migrate -w @todo-learn/database` (`prisma migrate dev --name add_category_icon`) — создаёт миграцию `ALTER TABLE "Category" ADD COLUMN "icon" TEXT;` и перегенерирует клиент.

### 2. Зависимости backend
- [ ] `npm i -w backend @nestjs/passport passport passport-jwt`
- [ ] `npm i -w backend -D @types/passport-jwt`

### 3. Общая JWT-инфраструктура (`backend/src/auth/`)
- [ ] `strategies/jwt.strategy.ts` — `JwtStrategy extends PassportStrategy(Strategy)`: `ExtractJwt.fromAuthHeaderAsBearerToken()`, `secretOrKey` из `ConfigService('JWT_SECRET')`, `validate(payload)` → `{ id: payload.sub, email: payload.email }`.
- [ ] `guards/jwt-auth.guard.ts` — `export class JwtAuthGuard extends AuthGuard('jwt') {}`.
- [ ] `decorators/current-user.decorator.ts` — `@CurrentUser()` (через `createParamDecorator`) → `request.user`.
- [ ] `contracts/auth-user.ts` — тип `AuthUser { id: string; email: string }`.
- [ ] `auth/auth.module.ts` — в `imports` добавить `PassportModule`, в `providers` — `JwtStrategy`.

### 4. User-модуль: запрос по id (CQRS)
- [ ] `contracts/get-user-by-id.query.ts` — `class GetUserByIdQuery { constructor(public readonly id: string) {} }`.
- [ ] `users/queries/get-user-by-id.handler.ts` — `@QueryHandler`, `prisma.user.findUnique({ where: { id }, select: { id, name, email } })` → `PublicUser | null`.
- [ ] `users/users.module.ts` — добавить `GetUserByIdHandler` в `providers`.

### 5. Контракты категорий (`backend/src/contracts/`, плоско)
- [ ] `category.dto.ts` — `CategoryDto { id; name; color; icon; userId; createdAt; updatedAt }`.
- [ ] `create-category.command.ts` — `CreateCategoryCommand(userId, name, color?, icon?)`.
- [ ] `update-category.command.ts` — `UpdateCategoryCommand(userId, id, patch)`.
- [ ] `delete-category.command.ts` — `DeleteCategoryCommand(userId, id)`.
- [ ] `get-categories.query.ts` — `GetCategoriesQuery(userId)`.

### 6. Модуль Categories (`backend/src/categories/`)
- [ ] `dto/create-category.dto.ts` — `name` (`@IsString @IsNotEmpty @MaxLength(50)`), `color` (`@IsOptional @IsString @Matches(/^#[0-9A-Fa-f]{6}$/)`), `icon` (`@IsOptional @IsString @MaxLength(50)`).
- [ ] `dto/update-category.dto.ts` — те же поля, все `@IsOptional()` (без `@nestjs/mapped-types`).
- [ ] `commands/create-category.handler.ts` — `prisma.category.create`; `P2002` → `ConflictException`.
- [ ] `commands/update-category.handler.ts` — `updateMany({ where: { id, userId }, data })`; `count === 0` → `NotFoundException`; вернуть обновлённую запись; `P2002` → `ConflictException`.
- [ ] `commands/delete-category.handler.ts` — `deleteMany({ where: { id, userId } })`; `count === 0` → `NotFoundException`.
- [ ] `queries/get-categories.handler.ts` — `findMany({ where: { userId }, orderBy: { createdAt: 'asc' } })`.
- [ ] `categories.service.ts` — инжектит `CommandBus`/`QueryBus`; `create` сначала `GetUserByIdQuery` (нет → `UnauthorizedException`), затем `CreateCategoryCommand`; `findAll/update/remove` → соответствующие query/command.
- [ ] `categories.controller.ts` — `@UseGuards(JwtAuthGuard) @Controller('categories')`: `POST /`, `GET /`, `PATCH /:id`, `DELETE /:id`, `@CurrentUser()` для `userId`.
- [ ] `categories.module.ts` — `imports: [CqrsModule]`, controller + service + 4 хендлера в `providers`.

### 7. Регистрация
- [ ] `backend/src/app.module.ts` — добавить `CategoriesModule` в `imports`.

---

## Проверка (end-to-end)
- [ ] `npm run build -w backend` без ошибок; `npm run lint`.
- [ ] `npm run start:dev -w backend`; получить `accessToken` через `POST /auth/register`.
- [ ] Без токена `GET /categories` → **401**.
- [ ] `POST /categories {name:"Еда", color:"#ef4444", icon:"utensils"}` → **201**; повтор того же `name` → **409**; невалидный `color` → **400**.
- [ ] `GET /categories` → массив своих категорий.
- [ ] `PATCH /categories/:id {name:"Продукты"}` → **200**; чужой/несуществующий id → **404**.
- [ ] `DELETE /categories/:id` → **200/204**; повтор → **404**.
