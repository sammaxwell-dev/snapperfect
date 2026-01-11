# Implementation Plan: Миграция на Vercel AI SDK

**Branch**: `001-vercel-ai-sdk-migration` | **Date**: 2026-01-09 | **Spec**: [spec.md](file:///Users/dwhitewolf/Work/MVP/snapperfect/specs/001-vercel-ai-sdk-migration/spec.md)
**Input**: Feature specification from `/specs/001-vercel-ai-sdk-migration/spec.md`

## Summary

Миграция с прямых HTTP-вызовов к Google Generative AI API на унифицированный Vercel AI SDK (`@ai-sdk/google`) для 3 endpoints генерации изображений. Видеогенерация (`/api/fashion-motion`) остаётся на `@google/genai` до появления нативной поддержки в AI SDK.

**Технический подход:**
- Замена raw `fetch()` на `generateText` с `responseModalities: ['Image']` для Gemini моделей
- Создание централизованного AI provider в `lib/ai-provider.ts`
- Сохранение всех текущих стилей, платформ и промптов
- Унификация обработки ошибок через AI SDK

## Technical Context

**Language/Version**: TypeScript 5+ (Next.js 16+)  
**Primary Dependencies**: `@ai-sdk/google` ^1.0.0, `ai` ^4.0.0, `@google/genai` ^1.35.0 (для видео)  
**Storage**: N/A (stateless API endpoints)  
**Testing**: Manual testing, `npm run build` для проверки сборки  
**Target Platform**: Vercel Edge / Node.js serverless  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Latency не хуже текущего +10%  
**Constraints**: Сохранение обратной совместимости API responses  
**Scale/Scope**: 3 endpoints миграции, 1 endpoint без изменений

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. AI-First Product Development** | ✅ PASS | AI-генерация остаётся основным механизмом. Миграция напрямую реализует требование Конституции (v1.1.0) по использованию Vercel AI SDK. |
| **II. Marketplace-Centric Design** | ✅ PASS | Все preset-ы платформ сохраняются (Amazon, eBay, Etsy и др.). Качество изображений не меняется |
| **III. Premium UX Standards** | ✅ PASS | Изменения только на backend, UX не затрагивается |
| **IV. Component-First Architecture** | ✅ PASS | API-роуты остаются в `app/api/[module]/`. Добавляется `lib/ai-provider.ts` для централизации |
| **V. Performance-First Approach** | ✅ PASS | AI SDK не добавляет значительного overhead. Сохраняется loading state UX |

**Gate Result**: ✅ ALL PASS — можно продолжать

## Project Structure

### Documentation (this feature)

```text
specs/001-vercel-ai-sdk-migration/
├── spec.md              # ✅ Created
├── plan.md              # ✅ This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal для этой фичи)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── generate/route.ts       # 🔄 Migrate to AI SDK
│   ├── product-enhance/route.ts # 🔄 Migrate to AI SDK
│   ├── angles/route.ts          # 🔄 Migrate to AI SDK
│   └── fashion-motion/route.ts  # ✅ No changes (keep @google/genai)
├── components/                   # ✅ No changes
└── [modules]/                    # ✅ No changes

lib/
└── ai-provider.ts                # ➕ NEW: Centralized AI provider config

package.json                      # 🔄 Add dependencies
```

**Structure Decision**: Next.js App Router structure preserved. New centralized provider added to `lib/` following Next.js conventions.

## Complexity Tracking

> Нет нарушений Constitution — таблица не требуется.

## Phase 0: Research

### Research Tasks

1. **AI SDK Image Generation API** — как использовать `generateText` с image output для Gemini моделей
2. **Image Input Handling** — как передавать base64 изображения через AI SDK
3. **Error Handling** — какие ошибки возвращает AI SDK и как их обрабатывать
4. **Provider Configuration** — как настроить apiKey через environment переменные

### Research Output

См. [research.md](file:///Users/dwhitewolf/Work/MVP/snapperfect/specs/001-vercel-ai-sdk-migration/research.md)

## Phase 1: Design & Contracts

### API Contracts (без изменений в интерфейсе)

Внешний API контракт остаётся без изменений. Изменения только внутренние:

| Endpoint | Request | Response | Change |
|----------|---------|----------|--------|
| `POST /api/generate` | `{ prompt, aspectRatio, style, model }` | `{ predictions: [...], success }` | Internal only |
| `POST /api/product-enhance` | `{ imageBase64, mimeType, style, platform }` | `{ predictions: [...], success }` | Internal only |
| `POST /api/angles` | `{ imageBase64, mimeType, rotation, tilt, zoom }` | `{ prediction, success }` | Internal only |
| `POST /api/fashion-motion` | `{ imageData, mimeType, aspectRatio }` | `{ videoData, success }` | **No change** |

### Data Model

Минимальные изменения — см. [data-model.md](file:///Users/dwhitewolf/Work/MVP/snapperfect/specs/001-vercel-ai-sdk-migration/data-model.md)

### Implementation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Route Layer                          │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│  │   /generate   │ │  /enhance    │ │   /angles    │      │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘     │
│          │                 │                 │              │
│          └─────────────────┼─────────────────┘              │
│                            │                                │
│                  ┌─────────▼─────────┐                      │
│                  │  lib/ai-provider  │                      │
│                  │  (centralized)    │                      │
│                  └─────────┬─────────┘                      │
│                            │                                │
│          ┌─────────────────┼─────────────────┐              │
│          │                 │                 │              │
│  ┌───────▼───────┐ ┌───────▼───────┐         │              │
│  │  @ai-sdk/    │ │  generateText │         │              │
│  │   google     │ │   (AI SDK)    │         │              │
│  └───────────────┘ └───────────────┘         │              │
│                                              │              │
│  ┌───────────────────────────────────────────▼──────┐      │
│  │            /api/fashion-motion                   │      │
│  │            (unchanged - @google/genai)           │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Next Steps

1. **Phase 0**: Создать `research.md` с результатами исследования AI SDK
2. **Phase 1**: Создать `data-model.md` и `quickstart.md`
3. **Phase 2**: Запустить `/speckit.tasks` для генерации задач
