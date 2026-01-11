# Implementation Plan: User Media Library

**Branch**: `004-user-media-library` | **Date**: 2026-01-11 | **Spec**: [spec.md](file:///Users/dwhitewolf/Work/MVP/snapperfect/specs/004-user-media-library/spec.md)

## Summary

Реализация персональной библиотеки сгенерированного контента с автоматическим сохранением изображений и видео в Supabase Storage. Гибридный подход: файлы в приватном бакете, метаданные в PostgreSQL с RLS-защитой.

## Technical Context

**Language/Version**: TypeScript 5+ (Next.js 16+)  
**Primary Dependencies**: `@supabase/ssr`, `@supabase/supabase-js`  
**Storage**: Supabase Storage (private bucket) + PostgreSQL  
**Testing**: Manual verification, browser testing  
**Target Platform**: Web (Vercel deployment)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: LCP < 1.5s, infinite scroll @ 20 items/page  
**Constraints**: Free Tier (1GB storage, no image transformations)  
**Scale/Scope**: MVP for single user testing

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-First Development | ✅ PASS | Сохраняет результаты AI-генерации |
| II. Marketplace-Centric | ✅ PASS | Метаданные включают platform info |
| III. Premium UX Standards | ✅ PASS | Grid UI, dark theme, hover states |
| IV. Component-First Architecture | ✅ PASS | Модульная структура `/library/` |
| V. Performance-First | ✅ PASS | Lazy loading, infinite scroll, signed URLs |

## Project Structure

### Documentation (this feature)

```text
specs/004-user-media-library/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 research decisions
├── data-model.md        # Entity definitions & RLS
├── quickstart.md        # Implementation guide
├── contracts/
│   ├── schema.sql       # PostgreSQL + Storage schema
│   └── api.md           # API endpoints specification
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
app/
├── api/
│   └── library/
│       ├── route.ts           # GET /api/library (list)
│       ├── [id]/
│       │   └── route.ts       # GET/DELETE /api/library/[id]
│       ├── batch/
│       │   └── route.ts       # DELETE /api/library/batch
│       └── usage/
│           └── route.ts       # GET /api/library/usage
├── library/
│   ├── page.tsx               # Library page
│   └── components/
│       ├── LibraryGrid.tsx    # Infinite scroll grid
│       ├── LibraryItem.tsx    # Item card component
│       ├── ItemModal.tsx      # Detail view modal
│       └── UsageIndicator.tsx # Storage usage bar
└── lib/
    └── library/
        └── save-to-library.ts # Save helper function
```

**Structure Decision**: Next.js App Router structure per Constitution IV. API routes isolated in `/api/`, page components in `/library/`.

## Implementation Phases

### Phase 1: Database & Storage Setup
1. Создать таблицу `library_items` с RLS
2. Создать приватный бакет `user-media`
3. Настроить Storage RLS policies
4. Протестировать политики в Dashboard

### Phase 2: Core API
1. `/api/library` — список с пагинацией (batch fetching signed URLs)
2. `/api/library/[id]` — детали + атомарное удаление (DB + Storage)
3. `/api/library/batch` — batch delete (limit: 20 items per request)
4. `/api/library/usage` — статистика

### Phase 3: Save Integration
1. Создать `lib/library/save-to-library.ts`
2. Интегрировать в `/api/product-enhance`
3. Интегрировать в `/api/fashion-motion`
4. Интегрировать в `/api/generate`
5. Интегрировать в `/api/angles`

### Phase 4: UI Components
1. `LibraryGrid.tsx` — infinite scroll
2. `LibraryItem.tsx` — карточка с превью
3. `ItemModal.tsx` — детали + "Use Prompt"
4. `UsageIndicator.tsx` — прогресс-бар
5. `library/page.tsx` — страница

### Phase 5: Navigation & Polish
1. Добавить "My Library" в Sidebar
2. Empty state для пустой библиотеки
3. Loading states
4. Error handling

## Verification Plan

### Manual Testing

1. **RLS Verification**:
   - Войти как User A, сгенерировать изображение
   - Войти как User B, проверить что изображение User A не видно
   - В Supabase SQL Editor: `SELECT * FROM library_items` — проверить user_id

2. **Storage Security**:
   - Получить signed URL для файла User A
   - Попробовать изменить user_id в пути — должен быть 403
   - После истечения TTL (1 час) — URL должен перестать работать

3. **UI Flow**:
   - Сгенерировать изображение → появляется в библиотеке
   - Открыть детали → видны metadata (prompt, style)
   - Нажать "Use Prompt" → редирект с заполненными параметрами
   - Удалить элемент → исчезает из библиотеки
   - Проверить infinite scroll при 30+ элементах

4. **Performance**:
   - Открыть библиотеку с 50 элементами
   - DevTools → Performance → LCP должен быть < 1.5s
   - Проверить lazy loading изображений (Network tab)

## Complexity Tracking

- **Atomic Deletes**: Реализовано на стороне сервера во избежание "файлов-сирот".
- **Free Tier Optimizations**: Использование `priority` и `loading="lazy"` для Next.js Image при отсутствии трансформаций.
- Нет нарушений Constitution — таблица не заполняется.

## Dependencies

- **003-supabase-auth**: Аутентификация должна быть полностью реализована
