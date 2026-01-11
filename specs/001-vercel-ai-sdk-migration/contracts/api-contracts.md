# API Contracts: Миграция на Vercel AI SDK

**Feature**: 001-vercel-ai-sdk-migration  
**Date**: 2026-01-09

## Overview

API контракты (request/response schemas) **остаются без изменений**.
Миграция затрагивает только внутреннюю реализацию endpoints.

## Endpoints

### POST /api/generate

**Request:**
```typescript
interface GenerateRequest {
  prompt: string;
  aspectRatio?: string;      // default: '1:1'
  numberOfImages?: number;   // default: 1
  style?: string;           // 'photo' | 'digital' | 'anime' | ...
  model?: string;           // default: 'gemini-2.5-flash-image'
  imageSize?: string;       // '1K' | '2K' | '4K'
}
```

**Response:**
```typescript
interface GenerateResponse {
  success: boolean;
  predictions: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
  }>;
  prompt?: string;
  error?: string;
}
```

---

### POST /api/product-enhance

**Request:**
```typescript
interface ProductEnhanceRequest {
  imageBase64: string;
  mimeType: string;
  style?: string;           // 'studio' | 'lifestyle' | 'minimalist' | ...
  platform?: string;        // 'amazon' | 'ebay' | 'etsy' | ...
  numberOfImages?: number;  // default: 1
  model?: string;           // default: 'gemini-3-pro-image-preview'
}
```

**Response:**
```typescript
interface ProductEnhanceResponse {
  success: boolean;
  predictions: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
  }>;
  style?: string;
  platform?: string;
  error?: string;
}
```

---

### POST /api/angles

**Request:**
```typescript
interface AnglesRequest {
  imageBase64: string;
  mimeType: string;
  rotation: number;    // -180 to 180
  tilt: number;        // -90 to 90
  zoom: number;        // 0 to 100
  model?: string;      // default: 'gemini-2.5-flash-image'
}
```

**Response:**
```typescript
interface AnglesResponse {
  success: boolean;
  prediction: {
    bytesBase64Encoded: string;
    mimeType: string;
  };
  angle?: { rotation: number; tilt: number; zoom: number };
  error?: string;
}
```

---

### POST /api/fashion-motion

> **No changes** — этот endpoint остаётся на `@google/genai`

**Request:**
```typescript
interface FashionMotionRequest {
  imageData: string;        // base64
  mimeType: string;
  aspectRatio?: '9:16' | '16:9';
  durationSeconds?: 4 | 6 | 8;
}
```

**Response:**
```typescript
interface FashionMotionResponse {
  success: boolean;
  videoData?: string;       // base64
  mimeType?: string;
  aspectRatio?: string;
  durationSeconds?: number;
  demo?: boolean;
  error?: string;
}
```

## Error Responses

Все endpoints используют унифицированный формат ошибок:

```typescript
interface ErrorResponse {
  success: false;
  error: string;
}
```

HTTP статус коды:
- `200` — Success
- `400` — Bad Request (invalid input)
- `500` — Internal Server Error (AI generation failed)
- `504` — Gateway Timeout (video generation timeout)
