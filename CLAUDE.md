# todo_learn — инструкции проекта

Учебный трекер расходов. Монорепозиторий npm workspaces:
`frontend` (Next.js 16, App Router) + `backend` (Nest.js 11) + `packages/database` (Prisma).

## Архитектура фронтенда — Feature-Sliced Design (FSD)

Фронтенд (`frontend/src`) организован по методологии [Feature-Sliced Design](https://feature-sliced.design).
Код разбит на **слои**, внутри слоёв — на **слайсы** (по домену), внутри слайсов — на **сегменты**
(`ui`, `model`, `api`, `lib`, `config`).

### Слои (сверху вниз по уровню абстракции)

| Слой         | Каталог             | Назначение                                                        |
| ------------ | ------------------- | ----------------------------------------------------------------- |
| `app`        | `src/app`           | Роутинг Next.js, провайдеры, глобальные стили. **Только тонкий вход.** |
| `views`      | `src/views`         | Композиция страницы целиком (аналог слоя `pages` в каноничном FSD). |
| `features`   | `src/features`      | Действия пользователя с бизнес-ценностью (логин, регистрация, создание транзакции). |
| `entities`   | `src/entities`      | Бизнес-сущности (сессия, категория, транзакция).                  |
| `shared`     | `src/shared`        | Переиспользуемый код без привязки к домену (UI-кит, api, config, lib). |

> Слой `pages` переименован в `views`, потому что `pages` конфликтует по смыслу с
> роутером Next.js. Роуты живут в `src/app/**/page.tsx` и лишь импортируют соответствующий
> `View` из слоя `views`.

### Правило импортов (главное)

Слой может импортировать **только слои строго ниже себя**:

```
app → views → features → entities → shared
```

Импорты «вверх» или «вбок» (между слайсами одного слоя) запрещены. Слайсы одного слоя
независимы; общий код поднимается на слой ниже.

### Публичный API слайса

Каждый слайс экспортирует наружу только то, что объявлено в его `index.ts`. Импортировать
внутренние файлы слайса напрямую (в обход `index.ts`) нельзя.

```ts
// хорошо
import { LoginForm } from '@/features/auth/login';
// плохо — обход публичного API
import { LoginForm } from '@/features/auth/login/ui/login-form';
```

### Алиас путей

`@/*` → `frontend/src/*` (см. `frontend/tsconfig.json`).

### UI-компоненты — shadcn/ui

Библиотека [shadcn/ui](https://ui.shadcn.com) (стиль new-york, base neutral). Компоненты
живут в `shared/ui`. `components.json` настроен так, что `npx shadcn@latest add <component>`
кладёт новые компоненты именно туда. Тема (CSS-переменные) — в `src/app/globals.css`.
Утилита `cn` — в `shared/lib/utils.ts`.

### Пример структуры (авторизация)

```
src/
├── app/
│   ├── layout.tsx            # SessionProvider + Toaster
│   ├── providers.tsx
│   ├── login/page.tsx        # → LoginView
│   └── register/page.tsx     # → RegisterView
│   └── transactions/page.tsx # → TransactionsView
├── views/
│   ├── login/                # LoginView (Card + LoginForm)
│   ├── register/             # RegisterView
│   └── transactions/         # TransactionsView (итоги + форма + список + фильтр)
├── features/
│   ├── auth/
│   │   ├── login/            # ui/model(schema)/api
│   │   └── register/
│   └── transaction/
│       └── create/           # TransactionForm (селект категорий)
├── entities/
│   ├── session/              # хранение токена (localStorage) + React-контекст
│   ├── category/             # тип Category + getCategories()
│   └── transaction/          # типы + get/create API + TransactionItem
└── shared/
    ├── ui/                   # shadcn-компоненты
    ├── api/                  # apiFetch, HttpError, authFetch (Bearer-токен)
    ├── config/               # env (API_URL)
    └── lib/                  # cn()
```

## Авторизация

- JWT (`accessToken`) хранится в `localStorage` (учебный проект; помнить про XSS-риск).
  Ключи: `todo_learn.token`, `todo_learn.user`. Работа с ними — только через `entities/session`.
- Backend отдаёт `{ accessToken, user: { id, name, email } }`.
- Эндпоинты: `POST /auth/register` (`name?`, `email`, `password` min 8),
  `POST /auth/login` (`email`, `password` min 8). База — `NEXT_PUBLIC_API_URL`.

### Авторизованные запросы

Для эндпоинтов, требующих токен, использовать `authFetch` из `shared/api` — он сам
подставляет `Authorization: Bearer <token>` из `localStorage`. Токен там читается напрямую
(ключ дублируется в `shared/api/authorized.ts`), чтобы `shared` не импортировал вышестоящий
слой `entities/session` — это нарушило бы правило импортов FSD. Публичные запросы (login/register)
идут через `apiFetch` без токена.

## Модуль транзакций (backend)

Backend-модули следуют CQRS-паттерну (`@nestjs/cqrs`): контроллер → сервис →
команды/запросы (`CommandBus`/`QueryBus`) → хендлеры (обращаются к Prisma). Образец — `categories`.

- Контракты (команды, запросы, DTO-интерфейсы) лежат в `backend/src/contracts/` — общая папка,
  чтобы модули могли обращаться к чужим командам/запросам.
- **Изоляция по пользователю** — обязательна на уровне Prisma: `where: { id, userId }` в
  `updateMany`/`deleteMany`/`findFirst`, при `count === 0` → `NotFoundException`. Так чужие
  записи не видны и не изменяются. `userId` берётся из `@CurrentUser()`, не из тела запроса.
- **Денежные суммы — `Decimal(12,2)`**, наружу отдаются строкой (маппер `toTransactionDto`,
  `amount.toFixed(2)`). Арифметика — только методами `Prisma.Decimal` (`.minus`, `.toFixed`).
- **Итоги** `GET /transactions` — два `aggregate` по `type` (income/expense), `_sum.amount`
  при пустой группе `?? new Prisma.Decimal(0)`.
- **Фильтр month/year** — диапазон дат строится в **UTC** (`Date.UTC`), согласован с
  `<input type="date">` на фронте.
- `amount` в DTO принимается **строкой** с `@Matches(/^\d+(\.\d{1,2})?$/)`, не `@IsNumber` —
  иначе `ValidationPipe({transform:true})` привёл бы к float и потерял точность.
- Query-параметры month/year в DTO — с `@Type(() => Number)`, иначе не приведутся к числу.

Полный список эндпоинтов — в `README.md`.

## Команды

```bash
npm run dev:web        # только frontend (порт 3000)
npm run dev:api        # только backend (порт 3001)
npm run build          # сборка backend + frontend
npm run lint           # ESLint по всему репо
npm run format         # Prettier
```

## Соглашение о коммитах

Проект использует [Conventional Commits](https://www.conventionalcommits.org).
Формат заголовка:

```
<type>(<scope>): <краткое описание>
```

- **type** (обязателен): `feat` (новая функциональность), `fix` (исправление бага),
  `docs` (документация), `refactor` (рефакторинг без смены поведения), `test` (тесты),
  `chore` (сборка, зависимости, конфиги), `style` (форматирование), `perf` (производительность).
- **scope** (необязателен) — область изменения: `backend`, `frontend`, `db`, `auth`,
  `transactions`, `categories` и т.п.
- **описание** — в повелительном наклонении, с маленькой буквы, без точки в конце,
  на русском языке. Заголовок — до ~70 символов.

Тело (необязательно, через пустую строку) — что и зачем, если не очевидно из заголовка.
Ломающие изменения помечать `!` после scope (`feat(db)!: ...`) или футером `BREAKING CHANGE:`.

Примеры:

```
feat(transactions): модуль учёта доходов и расходов
fix(auth): не отправлять agreement на backend при входе
docs: описать API транзакций в README
```

## Git Flow — GitHub Flow

Проект использует упрощённый Git Flow на базе [GitHub Flow](https://guides.github.com/flow/):

1. **Основная ветка** — `main`. Всегда стабильна, готова к деплою.
2. **Ветки фич** создаются от `main` с префиксом `feature/`:
   - `feature/main-screen` — новый экран
   - `feature/auth-oauth` — OAuth-авторизация
3. **Префиксы веток**:
   - `feature/` — новая функциональность
   - `fix/` — исправление багов
   - `hotfix/` — срочные исправления для production
4. **Именование** — краткое, в нижнем регистре, через дефис: `feature/login-page`.
5. **Коммиты** — по правилам Conventional Commits (см. выше).
6. **Pull Request**:
   - Создаётся в `main` когда фича готова к ревью
   - Требует минимум 1 аппрув перед мержем
   - Все CI-чеки должны проходить
   - После мержа ветка удаляется
7. **Деплой** происходит автоматически после мержа в `main`.
8. **Никогда** не пушить напрямую в `main` — только через PR.

### Создание Pull Request через GitHub CLI

После коммита изменений:

```bash
# Запушить ветку
git push -u origin <branch-name>

# Создать PR с подробным описанием
gh pr create \
  --title "feat(scope): краткое описание" \
  --body "## Summary\n\nОписание изменений...\n\n### Test Plan\n- [ ] ..." \
  --base main

# Или открыть в браузере (если нет прав у токена)
gh pr create --web
```

Шаблон описания PR:
- **Summary** — что реализовано, какие endpoints добавлены
- **Backend** — новые маршруты, DTO, хендлеры
- **Frontend** — новые view/feature/entity, изменения в архитектуре
- **Test Plan** — чеклист проверок
