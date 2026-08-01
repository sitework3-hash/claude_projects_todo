---
name: add-tests
description: Use when the user wants unit tests added for a specific file in todo_learn (backend service/handler, frontend hook/component/entity). Bootstraps the test runner if the workspace has none, writes the test file colocated with the source, and runs it to confirm it passes. Takes a file path as argument.
allowedTools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash(npm *)
  - Bash(npx *)
argument-hint: [file-path]
model: sonnet
effort: medium
---

# Add Tests

## Overview

Скилл пишет unit-тесты для одного файла, переданного аргументом. **Важно**: в
`todo_learn` сейчас нет ни одного тестового рантайма — ни в `backend`, ни в
`frontend` (`npm run test` не существует, `jest`/`vitest` не установлены). Поэтому
скилл сначала проверяет, настроен ли раннер для нужного workspace, и если нет —
устанавливает и конфигурирует минимальный стандартный набор для этого слоя
(см. шаг 2). Дальше он не отличается от обычного «допиши тесты»: анализирует файл,
пишет тест рядом и прогоняет его, чтобы подтвердить зелёный результат — заявлять
об успехе без реального запуска нельзя.

## Аргументы

`$1` — путь к файлу, для которого нужны тесты (относительно корня репозитория),
например:

```
/add-tests frontend/src/entities/transaction/lib/use-latest-transactions.ts
/add-tests backend/src/transactions/handlers/create-transaction.handler.ts
```

Если аргумент не передан или файл не существует — сообщить об этом и не
придумывать путь самостоятельно.

## Порядок действий

### 1. Определить workspace и конвенции слоя

- `backend/src/**` → Nest.js, тестовый раннер — **Jest** (`@nestjs/testing`), файл
  теста колоцирован рядом с исходником: `<name>.spec.ts`.
- `frontend/src/**` → Next.js/React, тестовый раннер — **Vitest** +
  `@testing-library/react`, файл теста колоцирован рядом: `<name>.test.ts(x)`.
- `packages/database/**` — в основном сгенерированный Prisma-клиент и миграции;
  если `$1` указывает сюда, предупредить, что модуль обычно не покрывают
  unit-тестами напрямую (это интеграционный слой), и уточнить у пользователя,
  что именно тестировать, вместо того чтобы писать тест вслепую.

Прочитать сам файл (`Read`), а для backend — также соответствующий раздел
`backend/CLAUDE.md` (изоляция по `userId`, `Decimal(12,2)`, UTC-диапазоны
month/year, `NotFoundException` при `count === 0`), для frontend —
`frontend/CLAUDE.md` (FSD-слой файла, публичный API слайса) — это определяет,
какие инварианты обязательно покрыть тестами, а не только happy path.

### 2. Проверить/настроить тестовый раннер для workspace

```bash
cat backend/package.json | grep -A5 '"scripts"'   # или frontend/package.json
find backend -maxdepth 1 -iname "jest.config*"     # или frontend -iname "vitest.config*"
```

Если раннер уже настроен (есть `"test"` в scripts и конфиг) — использовать его,
шаг пропустить.

**Backend (Jest), если отсутствует:**

```bash
npm install -D jest ts-jest @types/jest @nestjs/testing -w backend
```

Добавить в `backend/package.json` секцию `"jest"`:

```json
"jest": {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "testEnvironment": "node"
}
```

и скрипт `"test": "jest"`.

**Frontend (Vitest), если отсутствует:**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom -w frontend
```

Создать `frontend/vitest.config.ts` (алиас `@/*` — как в `frontend/tsconfig.json`)
и `frontend/vitest.setup.ts` с `import '@testing-library/jest-dom'`, добавить в
`frontend/package.json` скрипт `"test": "vitest run"`.

Устанавливать/конфигурировать только тот workspace, где лежит `$1` — второй слой
не трогать, даже если у него раннера тоже нет.

### 3. Проверить, нет ли уже теста для этого файла

Если `<name>.spec.ts` / `<name>.test.ts(x)` рядом с файлом уже существует —
прочитать его и **дополнить** недостающими кейсами, а не переписывать поверх уже
рабочих тестов.

### 4. Написать тест

Обязательно покрыть:
- основной happy path (то, что явно делает функция/компонент/хендлер);
- граничные случаи и уже задокументированные инварианты слоя (см. шаг 1) —
  например, для backend-хендлера транзакций — что чужой `userId` не видит и не
  меняет запись; для `use-latest-transactions`-подобного хука — поведение при
  сбросе (`offset === 0` должен заменять список, а не дописывать, ровно как было
  пофикшено в этом файле).
- поведение при ошибке (реджект промиса, `NotFoundException`, невалидный ввод),
  если файл вообще может ошибаться.

Backend — через `Test.createTestingModule` с моками `PrismaService`/зависимостей
(не поднимать реальную БД). Frontend-хуки — через `@testing-library/react`
(`renderHook`), компоненты — через `render`/`screen`, без снапшот-тестов ради
снапшотов.

### 5. Прогнать тест и подтвердить результат

```bash
npm test -w backend -- <name>.spec.ts     # или
npm test -w frontend -- <name>.test.ts
```

Показать пользователю фактический вывод команды. Если тест падает — чинить тест
или (если он вскрыл реальный баг) сообщить об этом отдельно, не подгонять тест
под баг молча.
