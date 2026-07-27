---
name: create-pr
description: Use when the user wants to open a GitHub pull request for a feature/fix branch in todo_learn — pushes the branch and runs `gh pr create` with the project's PR body template. Takes branch name and PR title as arguments. Manual invocation only (/create-pr), not auto-triggered.
allowedTools:
  - Bash(git *)
  - Bash(gh *)
argument-hint: [PR title] [branch-name, default: main]
model: claude-sonnet-4-5
effort: low
---
# Create PR

## Overview

Скилл создаёт Pull Request в `todo_learn` по правилам GitHub Flow из корневого
`CLAUDE.md`: пушит ветку и открывает PR через `gh pr create` с шаблоном описания
(Summary / Test Plan). Только ручной вызов — PR — это видимое всем и не тривиально
обратимое действие, автоматически Claude его не запускает.

## Аргументы

 `$0` — Название PR

` $1 — имя ветки (одно слово, без пробелов).`


## Алгоритм

1. Проверить, что текущая ветка не main или develop
2. Убедиться, что ветка запушена в remote
3. Получить список коммитов: git log main..$0 --oneline
4. Получить полный diff: git diff main
5. На основе коммитов составить описание PR
6. Создать PR: gh pr create --title "$0" --base "$1" --body "..."
7. Вывести URL созданного PR

Если $1 не передан — использовать main как целевую ветку.
Если PR для этой ветки уже существует — сообщить и вывести ссылку.
