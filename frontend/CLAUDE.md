# todo_learn — frontend (Next.js)

Этот файл дополняет корневой `../CLAUDE.md` (он всегда подгружается) правилами,
специфичными для `frontend/`. Загружается вместе с корневым, когда Claude Code
работает внутри этой директории.

## Архитектура — Feature-Sliced Design (FSD)

Фронтенд (`frontend/src`) организован по методологии [Feature-Sliced Design](https://feature-sliced.design).
Код разбит на **слои**, внутри слоёв — на **слайсы** (по домену), внутри слайсов — на **сегменты**
(`ui`, `model`, `api`, `lib`, `config`).

### Слои (сверху вниз по уровню абстракции)

| Слой       | Каталог        | Назначение                                                                          |
| ---------- | -------------- | ----------------------------------------------------------------------------------- |
| `app`      | `src/app`      | Роутинг Next.js, провайдеры, глобальные стили. **Только тонкий вход.**              |
| `views`    | `src/views`    | Композиция страницы целиком (аналог слоя `pages` в каноничном FSD).                 |
| `features` | `src/features` | Действия пользователя с бизнес-ценностью (логин, регистрация, создание транзакции). |
| `entities` | `src/entities` | Бизнес-сущности (сессия, категория, транзакция).                                    |
| `shared`   | `src/shared`   | Переиспользуемый код без привязки к домену (UI-кит, api, config, lib).              |

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
кладёт новые компоненты именно туда (`aliases.components`/`ui` → `@/shared/ui`). Тема
(CSS-переменные) — в `src/app/globals.css`. Утилита `cn` — в `shared/lib/utils.ts`.

### Структура (актуальная)

```
src/
├── app/
│   ├── layout.tsx              # SessionProvider + Toaster
│   ├── providers.tsx
│   ├── page.tsx                 # → DashboardView
│   ├── login/page.tsx           # → LoginView
│   ├── register/page.tsx        # → RegisterView
│   ├── transactions/page.tsx    # → TransactionsView
│   └── categories/page.tsx      # → CategoriesView
├── views/
│   ├── dashboard/                # DashboardView (итоги, последние транзакции, навигация)
│   ├── login/                    # LoginView (Card + LoginForm)
│   ├── register/                 # RegisterView
│   ├── transactions/              # TransactionsView (итоги + форма + список + фильтр)
│   └── categories/                # CategoriesView (форма + список, правка/удаление инлайн)
├── features/
│   ├── auth/
│   │   ├── login/                # ui/model(schema)/api
│   │   └── register/
│   ├── navigation/                # NavMenu
│   ├── category/
│   │   ├── create/                # CategoryCreateForm
│   │   └── edit/                  # CategoryEditForm (инлайн-правка строки списка)
│   └── transaction/
│       └── create/                # TransactionForm (селект категорий)
├── entities/
│   ├── session/                   # хранение токена (localStorage) + React-контекст
│   ├── category/                  # тип + CRUD-API + zod-схема + config (цвета/иконки) + UI
│   └── transaction/                # типы + get/create/get-latest API + lib (пагинация) + TransactionItem
└── shared/
    ├── ui/                        # shadcn-компоненты
    ├── api/                       # apiFetch, HttpError, authFetch (Bearer-токен)
    ├── config/                    # env (API_URL)
    └── lib/                       # cn()
```

## Авторизация (клиент)

Backend отдаёт `{ accessToken, user: { id, name, email } }` для `POST /auth/register` и
`POST /auth/login` (полный контракт, включая валидацию — в `backend/CLAUDE.md`).

- JWT (`accessToken`) хранится в `localStorage` (учебный проект; помнить про XSS-риск).
  Ключи: `todo_learn.token`, `todo_learn.user`. Работа с ними — только через `entities/session`.
- Публичные запросы (login/register) идут через `apiFetch` без токена.

### Авторизованные запросы

Для эндпоинтов, требующих токен, использовать `authFetch` из `shared/api` — он сам
подставляет `Authorization: Bearer <token>` из `localStorage`. Токен там читается напрямую
(ключ дублируется в `shared/api/authorized.ts`), чтобы `shared` не импортировал вышестоящий
слой `entities/session` — это нарушило бы правило импортов FSD. Публичные запросы (login/register)
идут через `apiFetch` без токена.

## Пагинация последних транзакций

`entities/transaction/lib/use-latest-transactions.ts` грузит `GET /transactions/latest`
постранично (`limit=10`). При `offset === 0` результат **заменяет** список, а не
дописывается в конец — это важно из-за React StrictMode, который в dev вызывает
эффекты дважды: если бы первая страница всегда дописывалась, она задваивалась бы при
каждом маунте. При `offset > 0` (подгрузка через `loadMore`) — дописывается в конец.

## Категории

Общий код двух feature-слайсов (`category/create` и `category/edit`) лежит в
`entities/category`, а не в одном из них: слайсы одного слоя не имеют права
импортировать друг друга. Туда вынесены zod-схема формы (`model/schema.ts`),
палитра цветов и набор иконок (`config/appearance.ts`) и общий
`CategoryAppearancePicker`.

- **Иконка хранится как имя** (строка в БД), поэтому набор фиксирован —
  `CATEGORY_ICONS`. Рендерить произвольное имя пришлось бы динамическим импортом
  всей библиотеки lucide.
- **Цвет выбирается кнопками палитры**, а не `<input type="color">`: backend
  валидирует hex из 6 знаков, а готовый набор значений заведомо ему соответствует.
  Повторный клик снимает выбор — это `null` («без цвета»).
- **`null` против `undefined`**: в `PATCH` `null` означает сброс оформления
  (`@IsOptional()` пропускает его, Prisma пишет NULL), а при создании
  «не выбрано» отправляется как `undefined` — поле просто не уходит в теле.

## Команды (только frontend)

```bash
npm run dev:web        # dev -w frontend, порт 3000
```

Полный список npm-скриптов монорепо — в корневом `CLAUDE.md`.
