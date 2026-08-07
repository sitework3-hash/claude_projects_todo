---
name: commit
description: Создать коммит по соглашению проекта с описанием на русском
allowedTools:
  - Bash(git *)
model: claude-sonnet-4-5
effort: low
---

## Правила коммитов

Типы: feat, fix, docs, refactor, test, ci
Scope: backend, frontend, shared, config
Описание: кратко на русском, в настоящем времени

## Примеры
feat(backend): добавить модуль транзакций
fix(frontend): исправить валидацию формы регистрации

## Контекст выполнения
Статус проекта: !git status
Последние коммиты: !git log --oneline -10

## Алгоритм
1. Получить полный diff: git diff HEAD
2. Определить type и scope по изменениям
3. git add — добавить только нужные файлы (не git add .)
4. Сформировать сообщение по Conventional Commits
5. Создать коммит через heredoc
6. Проверить результат: git log --oneline -1

## Запрещено
- Никогда не пушить автоматически
- Не использовать --no-verify или --amend без явной просьбы
- Не добавлять файлы без понимания их содержимого