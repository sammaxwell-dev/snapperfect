# API Contracts: User Media Library

## Overview

API endpoints для управления библиотекой пользовательского контента.

---

## Endpoints

### GET `/api/library`

Получить список элементов библиотеки пользователя.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Количество элементов на страницу |
| `offset` | number | 0 | Смещение для пагинации |
| `type` | string | null | Фильтр по типу: `image`, `video` |

**Response** (200):
```json
{
  "success": true,
  "items": [
    {
      "id": "uuid",
      "media_type": "image",
      "source": "product-enhance",
      "created_at": "2026-01-11T12:00:00Z",
      "file_size": 245000,
      "signed_url": "https://...",
      "metadata": {
        "prompt": "...",
        "style": "studio",
        "aspect_ratio": "1:1"
      }
    }
  ],
  "total": 150,
  "has_more": true
}
```

**Response** (401):
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

### GET `/api/library/[id]`

Получить детали одного элемента.

**Response** (200):
```json
{
  "success": true,
  "item": {
    "id": "uuid",
    "media_type": "image",
    "source": "product-enhance",
    "created_at": "2026-01-11T12:00:00Z",
    "file_size": 245000,
    "signed_url": "https://...",
    "metadata": {
      "prompt": "...",
      "model": "gemini-2.0-flash-exp",
      "style": "studio",
      "platform": "amazon",
      "aspect_ratio": "1:1"
    }
  }
}
```

**Response** (404):
```json
{
  "success": false,
  "error": "Item not found"
}
```

---

### DELETE `/api/library/[id]`

Удалить элемент из библиотеки (и файл из Storage).

**Response** (200):
```json
{
  "success": true
}
```

**Response** (404):
```json
{
  "success": false,
  "error": "Item not found"
}
```

---

### DELETE `/api/library/batch`

Удалить несколько элементов одновременно.

**Request Body**:
```json
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Constraints**:
- Максимум 20 элементов за один запрос.

**Response** (200):
```json
{
  "success": true,
  "deleted": 3
}
```

---

### GET `/api/library/usage`

Получить статистику использования хранилища.

**Response** (200):
```json
{
  "success": true,
  "usage": {
    "used_bytes": 524288000,
    "total_bytes": 1073741824,
    "used_percent": 48.8,
    "item_count": 150,
    "images_count": 120,
    "videos_count": 30
  }
}
```

---

## Internal Functions

### `saveToLibrary()`

Вызывается из API routes после успешной генерации.

**Signature**:
```typescript
async function saveToLibrary(
  userId: string,
  mediaType: 'image' | 'video',
  source: 'product-enhance' | 'fashion-motion' | 'generate' | 'angles',
  fileData: string, // base64
  mimeType: string,
  metadata: Record<string, unknown>
): Promise<{ id: string; storage_path: string } | null>
```

**Logic**:
1. Generate unique filename: `{timestamp}-{random}.{ext}`
2. Upload to Storage: `user-media/{userId}/{filename}`
3. Insert record to `library_items`
4. Return record or null on error

**Security Note**: Deletion must be atomic. The API route deleting a DB record MUST also delete the corresponding file from Supabase Storage within the same server context.

---

## TypeScript Types

```typescript
interface LibraryItem {
  id: string;
  user_id: string;
  storage_path: string;
  media_type: 'image' | 'video';
  metadata: LibraryItemMetadata;
  file_size: number;
  source: 'product-enhance' | 'fashion-motion' | 'generate' | 'angles';
  created_at: string;
  signed_url?: string; // Added on read
}

interface LibraryItemMetadata {
  prompt?: string;
  model?: string;
  seed?: number;
  aspect_ratio?: string;
  style?: string;
  platform?: string;
  duration_seconds?: number;
}

interface LibraryListResponse {
  success: boolean;
  items: LibraryItem[];
  total: number;
  has_more: boolean;
}

interface LibraryUsageResponse {
  success: boolean;
  usage: {
    used_bytes: number;
    total_bytes: number;
    used_percent: number;
    item_count: number;
    images_count: number;
    videos_count: number;
  };
}
```
