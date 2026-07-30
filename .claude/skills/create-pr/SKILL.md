---
name: create-pr
description: Use when the user wants to open a GitHub pull request for a feature/fix branch in todo_learn — pushes the branch and runs `gh pr create` with the project's PR body template. Takes branch name and PR title as arguments. Manual invocation only (/create-pr), not auto-triggered.
disable-model-invocation: true
allowedTools:
  - Bash(git *)
  - Bash(gh *)
argument-hint: [branch-name] [PR title]
model: sonnet
effort: low
---

# Create PR

## Overview

Скилл создаёт Pull Request в `todo_learn` по правилам GitHub Flow из корневого
`CLAUDE.md`: пушит ветку и открывает PR через `gh pr create` с шаблоном описания
(Summary / Test Plan). Только ручной вызов — PR — это видимое всем и не тривиально
обратимое действие, автоматически Claude его не запускает.

`base` для PR — всегда `main` (правило проекта: PR создаются только в `main`,
никаких других целевых веток). Это захардкожено в алгоритме ниже, а не берётся из
аргумента.

## Аргументы

`$1` — имя ветки-источника (одно слово, без пробелов).
Заголовок PR — это `$ARGUMENTS` за вычетом первого слова (`$1`): т.е. вся строка
аргументов после ветки, в формате Conventional Commits, как в скилле `commit`
(`<type>(<scope>): <описание>`, на русском, до ~70 символов). Заголовок может
содержать пробелы — брать его из `$ARGUMENTS`, а не из отдельного позиционного
плейсхолдера (`$2` и далее — это только первое следующее слово, а не остаток
строки).

Пример:

```
/create-pr fix/transactions-pagination fix(transactions): не дублировать записи при сбросе списка
```

здесь `$1` = `fix/transactions-pagination`, заголовок = `fix(transactions): не
дублировать записи при сбросе списка`.

Если название PR не в формате Conventional Commits — не блокировать выполнение,
но предупредить и предложить переформулировать по конвенции проекта.

## Порядок действий

### 1. Проверить входные данные

- Если `$1` (ветка) равен `main` — остановиться с ошибкой: «нельзя открывать PR из
  `main` в `main`».
- Если заголовок PR пустой — попросить его у пользователя, не придумывать
  самостоятельно.

### 2. Проверить состояние репозитория

```bash
git status
git branch --show-current
```

- Если есть незакоммиченные изменения, которые должны войти в PR, но не
  закоммичены — сообщить об этом и не продолжать (закоммитить — отдельная задача,
  см. скилл `commit`).
- Если текущая ветка не совпадает с `$1`:
  - ветка `$1` существует локально → `git checkout "$1"`;
  - не существует → создать от актуального `main`:
    ```bash
    git fetch origin main
    git checkout -b "$1" origin/main
    ```

### 3. Проверить, нет ли уже PR для этой ветки

```bash
gh pr list --head "$1" --state all --json url,state --jq '.[0]'
```

Если открытый PR уже существует — сообщить об этом и вывести его ссылку, дальше
не продолжать (не создавать дубликат).

### 4. Собрать контекст для тела PR

```bash
git log origin/main.."$1" --oneline
git diff origin/main..."$1" --stat
```

По этому выводу — а не только по последнему коммиту — составить `Summary` (что
сделано, по каждому логическому блоку изменений) и чеклист `Test Plan`.

### 5. Запушить ветку

```bash
git push -u origin "$1"
```

Если у ветки уже есть upstream и она не расходится — обычный `git push`.

### 6. Создать PR

Использовать `--body-file -` с heredoc (см. корневой `CLAUDE.md` — `gh pr create
--body` не разворачивает `\n`, многострочное тело сломается без `--body-file`):

```bash
gh pr create \
  --title "<заголовок PR>" \
  --base main \
  --body-file - <<'EOF'
## Summary
- <пункт 1>
- <пункт 2>

### Test Plan
- [ ] <проверка 1>
- [ ] <проверка 2>
EOF
```

### 7. Вывести результат

Показать пользователю URL созданного PR из вывода `gh pr create` (команда сама
печатает ссылку в stdout).
