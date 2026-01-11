# Quickstart: Миграция на Vercel AI SDK

**Feature**: 001-vercel-ai-sdk-migration  
**Date**: 2026-01-09

## Prerequisites

- Node.js 18+
- npm 9+
- Existing `GEMINI_API_KEY` in `.env`

## Installation

```bash
# Установить новые зависимости
npm install @ai-sdk/google ai
```

## Quick Test

После установки зависимостей, проверить что всё работает:

```bash
# 1. Запустить dev сервер
npm run dev

# 2. Открыть http://localhost:3000

# 3. Протестировать каждый endpoint:
#    - Generate: ввести промпт, проверить генерацию
#    - Product Enhance: загрузить фото, выбрать стиль
#    - Angles: загрузить фото, изменить угол
#    - Fashion Motion: загрузить фото модели (должен работать без изменений)
```

## Environment Variables

```bash
# .env
GEMINI_API_KEY=your_api_key_here

# AI SDK автоматически использует GOOGLE_GENERATIVE_AI_API_KEY,
# но мы переопределяем через GEMINI_API_KEY для совместимости
```

## File Changes Summary

| File | Change |
|------|--------|
| `package.json` | Add `@ai-sdk/google`, `ai` |
| `lib/ai-provider.ts` | NEW - centralized provider |
| `app/api/generate/route.ts` | Migrate to AI SDK |
| `app/api/product-enhance/route.ts` | Migrate to AI SDK |
| `app/api/angles/route.ts` | Migrate to AI SDK |
| `app/api/fashion-motion/route.ts` | **No changes** |

## Rollback

Если что-то пошло не так:

```bash
# Откатить изменения
git checkout main -- app/api/
git checkout main -- package.json

# Удалить новые зависимости
npm install
```

## Verification Checklist

- [ ] `npm run build` проходит без ошибок
- [ ] `/api/generate` возвращает изображения
- [ ] `/api/product-enhance` улучшает фото продукта
- [ ] `/api/angles` меняет ракурс
- [ ] `/api/fashion-motion` генерирует видео (без изменений)
- [ ] Demo mode работает без API key
