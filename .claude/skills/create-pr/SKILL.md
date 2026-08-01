---
name: pr
description: Создать pull request на GitHub с заданными параметрами
argumentsHint: "title, base_branch (default: main)"
allowedTools:
  - Bash(git *)
  - Bash(gh *)
model: claude-sonnet-4-5
---

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
