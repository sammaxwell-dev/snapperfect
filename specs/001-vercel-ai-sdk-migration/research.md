# Research: Миграция на Vercel AI SDK

**Feature**: 001-vercel-ai-sdk-migration  
**Date**: 2026-01-09

## 1. AI SDK Image Generation API

### Decision: Использовать `generateText` с `responseModalities: ['Image']`

**Rationale**: Vercel AI SDK v4+ поддерживает генерацию изображений через Gemini модели двумя способами:

1. **`generateImage()`** — для Imagen моделей (imagen-4.0-generate-001)
2. **`generateText()`** с image output — для Gemini моделей с поддержкой генерации изображений

Текущий проект использует Gemini модели (`gemini-2.5-flash-image`, `gemini-3-pro-image-preview`), поэтому подходит второй способ.

**Пример использования:**
```typescript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const result = await generateText({
  model: google('gemini-2.5-flash-image-preview'),
  prompt: 'Create an image of...',
  providerOptions: {
    google: {
      responseModalities: ['Image'],
      imageConfig: {
        aspectRatio: '1:1'
      }
    }
  }
});

// Изображения доступны в result.files
for (const file of result.files ?? []) {
  if (file.mediaType.startsWith('image/')) {
    // file.data содержит Uint8Array с данными изображения
    // file.mediaType содержит MIME type
  }
}
```

**Alternatives considered:**
- `generateImage()` с Imagen — не подходит, т.к. используем Gemini модели
- Прямые вызовы REST API — текущая реализация, от которой уходим

---

## 2. Image Input Handling

### Decision: Использовать `messages` с image parts для image-to-image

**Rationale**: Для endpoints `/api/product-enhance` и `/api/angles` нужно передавать исходное изображение. AI SDK поддерживает multimodal input:

```typescript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const result = await generateText({
  model: google('gemini-2.5-flash-image'),
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          image: imageBase64, // base64 string или URL
          mimeType: 'image/jpeg'
        },
        {
          type: 'text',
          text: 'Transform this image with studio lighting...'
        }
      ]
    }
  ],
  providerOptions: {
    google: {
      responseModalities: ['Image'],
      imageConfig: { aspectRatio }
    }
  }
});
```

**Key points:**
- AI SDK принимает base64 напрямую (без prefix `data:image/...`)
- Можно также передавать URL изображения
- `mimeType` указывается отдельно

---

## 3. Error Handling

### Decision: Использовать try/catch с типизированными ошибками AI SDK

**Rationale**: AI SDK выбрасывает типизированные ошибки:

```typescript
import { AIError, APICallError } from 'ai';

try {
  const result = await generateText({...});
} catch (error) {
  if (error instanceof APICallError) {
    // Ошибки API (rate limit, quota, invalid request)
    console.error('API Error:', error.message);
    console.error('Status:', error.statusCode);
  } else if (error instanceof AIError) {
    // Общие ошибки AI SDK
    console.error('AI Error:', error.message);
  }
  // Fallback error handling
}
```

**Mapping to user-friendly messages:**

| SDK Error | User Message |
|-----------|--------------|
| `statusCode: 429` | "API quota exceeded. Please try again later." |
| `message.includes('safety')` | "Image was blocked by safety filters." |
| `statusCode: 400` | "Invalid request. Please check your input." |
| Other | "Image generation failed. Please try again." |

---

## 4. Provider Configuration

### Decision: Создать `lib/ai-provider.ts` с централизованной конфигурацией

**Rationale**: Унификация API key и настроек для всех endpoints.

```typescript
// lib/ai-provider.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Создаём провайдер с API key из env
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Модели для генерации изображений
export const GEMINI_IMAGE_MODELS = {
  flash: 'gemini-2.5-flash-image',
  pro: 'gemini-3-pro-image-preview',
} as const;

// Проверка demo-режима
export function isDemoMode(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return !apiKey || apiKey === 'your_api_key_here';
}

// Обработка ошибок
export function handleAIError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('quota')) {
      return 'API quota exceeded. Please try again later.';
    }
    if (error.message.includes('safety')) {
      return 'Image was blocked by safety filters.';
    }
  }
  return 'Image generation failed. Please try again.';
}
```

**Key points:**
- `GEMINI_API_KEY` работает с AI SDK (тот же ключ, что и для REST API)
- По умолчанию AI SDK использует `GOOGLE_GENERATIVE_AI_API_KEY`, но можно переопределить через `apiKey`
- Demo mode сохраняется для development

---

## 5. Package Versions

### Decision: `@ai-sdk/google` ^1.0.0, `ai` ^4.0.0

**Rationale**: Последние stable версии с поддержкой Gemini image generation.

```json
{
  "dependencies": {
    "@ai-sdk/google": "^1.0.0",
    "ai": "^4.0.0"
  }
}
```

**Compatibility:**
- ✅ Next.js 16+
- ✅ React 19
- ✅ TypeScript 5+
- ✅ `@google/genai` для видео (можно использовать оба пакета)

---

## Summary

| Question | Decision | Confidence |
|----------|----------|------------|
| Image Generation API | `generateText` + `responseModalities: ['Image']` | ✅ High |
| Image Input | Multimodal `messages` с base64 | ✅ High |
| Error Handling | Try/catch + типизированные ошибки | ✅ High |
| Provider Config | Centralized `lib/ai-provider.ts` | ✅ High |
| Package Versions | `@ai-sdk/google@^1.0.0`, `ai@^4.0.0` | ✅ High |

**All NEEDS CLARIFICATION resolved** ✅
