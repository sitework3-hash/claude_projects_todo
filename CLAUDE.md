# todo_learn — инструкции проекта

Учебный трекер расходов. Монорепозиторий npm workspaces:
`frontend` (Next.js 16, App Router) + `backend` (Nest.js 11) + `packages/database` (Prisma).

Этот файл — общий для всего монорепо и загружается всегда. Специфика конкретного
приложения — в `frontend/CLAUDE.md` (Feature-Sliced Design, авторизация на клиенте) и
`backend/CLAUDE.md` (CQRS-модули, контракт эндпоинтов, работа с Decimal). Они подгружаются
дополнительно, когда Claude Code работает внутри соответствующей директории — так контекст
не раздувается архитектурными деталями чужого слоя.

## Memory

Memory для этого проекта хранится локально в `.claude/memory/` (gitignored), а не в
глобальной папке харнесса — прочитать `.claude/memory/MEMORY.md` в начале работы.

## Авторизация — общая схема

JWT (`accessToken`), выдаётся `POST /auth/register` / `POST /auth/login`. Хранение и
подстановка токена на клиенте — `frontend/CLAUDE.md`; контракт эндпоинтов и валидация —
`backend/CLAUDE.md`.

## Команды

```bash
npm run dev:web        # только frontend (порт 3000)
npm run dev:api        # только backend (порт 3001)
npm run build           # сборка backend + frontend
npm run lint             # ESLint по всему репо
npm run format           # Prettier
npm run db:generate     # Prisma client
npm run db:migrate      # Prisma migrate
npm run db:studio       # Prisma Studio
```

## Соглашение о коммитах

Формат сообщений коммитов (Conventional Commits, type/scope, примеры) — в скилле
`commit` (`.claude/skills/commit/`). Использовать его при коммите в этом репозитории.

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

# Создать PR с подробным описанием.
# ВАЖНО: gh pr create --body НЕ разворачивает \n — многострочное описание
# передаём через --body-file (heredoc), иначе переносы попадут как текст.
gh pr create \
  --title "feat(scope): краткое описание" \
  --base main \
  --body-file - <<'EOF'
## Summary

Описание изменений...

### Test Plan
- [ ] ...
EOF

# Короткое однострочное описание можно и через --body:
gh pr create --title "fix(scope): описание" --body "Однострочное описание" --base main

# Или открыть в браузере (если нет прав у токена):
gh pr create --web
```

Шаблон описания PR:
- **Summary** — что реализовано, какие endpoints добавлены
- **Backend** — новые маршруты, DTO, хендлеры
- **Frontend** — новые view/feature/entity, изменения в архитектуре
- **Test Plan** — чеклист проверок
