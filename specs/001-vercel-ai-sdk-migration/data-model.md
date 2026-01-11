# Data Model: Миграция на Vercel AI SDK

**Feature**: 001-vercel-ai-sdk-migration  
**Date**: 2026-01-09

## Overview

Миграция не вносит изменений в data model приложения. Изменения касаются только внутренней реализации API endpoints.

## Entities (без изменений)

Существующие entities остаются без изменений:

| Entity | Description | Location |
|--------|-------------|----------|
| GenerateRequest | Запрос генерации изображения | Request body `/api/generate` |
| ProductEnhanceRequest | Запрос улучшения продукта | Request body `/api/product-enhance` |
| AnglesRequest | Запрос изменения ракурса | Request body `/api/angles` |
| FashionMotionRequest | Запрос генерации видео | Request body `/api/fashion-motion` |

## New Internal Types

Новые types для AI SDK интеграции:

### AIProviderConfig

```typescript
// lib/ai-provider.ts

interface AIProviderConfig {
  apiKey: string | undefined;
  baseURL?: string;
}

type GeminiImageModel = 
  | 'gemini-2.5-flash-image'
  | 'gemini-3-pro-image-preview';

interface ImageGenerationConfig {
  aspectRatio: string;
  imageSize?: '1K' | '2K' | '4K';
}
```

### AI SDK Response Types

```typescript
// Типы AI SDK (из пакета 'ai')
import type { GenerateTextResult } from 'ai';

// Файл из result.files
interface GeneratedFile {
  data: Uint8Array;
  mediaType: string;
}
```

## State Transitions

Нет state transitions — endpoints являются stateless.

## Validation Rules

Все существующие validation rules сохраняются:

| Field | Rule | Endpoint |
|-------|------|----------|
| `prompt` | Required, non-empty | `/api/generate` |
| `imageBase64` | Required, valid base64 | `/api/product-enhance`, `/api/angles` |
| `mimeType` | Required, valid image MIME | `/api/product-enhance`, `/api/angles` |
| `aspectRatio` | Optional, default '1:1' | All image endpoints |
| `style` | Optional, from predefined list | `/api/generate`, `/api/product-enhance` |

## Migration Notes

- Response format остаётся идентичным текущему
- `bytesBase64Encoded` в ответе формируется из `file.data` (Uint8Array → base64)
- `mimeType` берётся из `file.mediaType`
