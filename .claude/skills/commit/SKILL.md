---
name: commit
description: Use when writing a git commit message in the todo_learn repo — commit type/scope conventions, message format, and examples (Conventional Commits, Russian description text).
allowedTools:
  - Bash(git *)
model: sonnet
effort: low
---

# Commit

## Overview

`todo_learn` использует [Conventional Commits](https://www.conventionalcommits.org).
Формат заголовка:

```
<type>(<scope>): <краткое описание>
```

## Type (обязателен)

| type       | значение                                |
| ---------- | ---------------------------------------- |
| `feat`     | новая функциональность                   |
| `fix`      | исправление бага                         |
| `docs`     | документация                             |
| `refactor` | рефакторинг без смены поведения          |
| `test`     | тесты                                    |
| `chore`    | сборка, зависимости, конфиги             |
| `style`    | форматирование                           |
| `perf`     | производительность                       |

## Scope (необязателен)

Область изменения: `backend`, `frontend`, `db`, `auth`, `transactions`, `categories` и т.п.

## Описание

- В повелительном наклонении, с маленькой буквы, без точки в конце, **на русском языке**.
- Заголовок — до ~70 символов.
- Тело (необязательно, через пустую строку) — что и зачем, если не очевидно из заголовка.
- Ломающие изменения — `!` после scope (`feat(db)!: ...`) или футер `BREAKING CHANGE:`.

## Примеры

```
feat(transactions): модуль учёта доходов и расходов
fix(auth): не отправлять agreement на backend при входе
docs: описать API транзакций в README
```

## Связанное

Ветки/PR/GitHub Flow — в корневом `CLAUDE.md` (раздел «Git Flow»), это отдельно от
формата самого сообщения коммита.
