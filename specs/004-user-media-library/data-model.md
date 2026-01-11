# Data Model: User Media Library

## Entities

### `public.library_items`

- **Description**: Хранит метаданные о сгенерированных изображениях и видео пользователя.
- **Key Fields**:
    - `id` (PK, UUID): Уникальный идентификатор записи.
    - `user_id` (UUID, FK → `auth.users.id`): Владелец контента.
    - `storage_path` (Text): Полный путь к файлу в бакете (`{user_id}/{filename}`).
    - `media_type` (Enum: `media_type` → 'image', 'video'): Тип контента.
    - `metadata` (JSONB): Параметры генерации (prompt, model, seed, aspect_ratio, mode, style).
    - `file_size` (Integer): Размер файла в байтах.
    - `source` (Enum: `generation_source` → 'product-enhance', 'fashion-motion', 'generate', 'angles'): Источник генерации.
    - `created_at` (Timestamp with time zone): Дата создания.

- **Relationships**: Many-to-One с `auth.users`.

### `storage.objects` (System Table)

- **Description**: Системная таблица Supabase Storage.
- **Key Fields**: `name`, `bucket_id`, `owner`, `created_at`, `metadata`.
- **Relationships**: Связь через `storage_path` в `library_items`.

---

## Enums

- **`media_type`**: `['image', 'video']`
- **`generation_source`**: `['product-enhance', 'fashion-motion', 'generate', 'angles']`

---

## SQL Schema

```sql
-- Enum types
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE generation_source AS ENUM ('product-enhance', 'fashion-motion', 'generate', 'angles');

-- Main table
CREATE TABLE public.library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    media_type media_type NOT NULL,
    metadata JSONB DEFAULT '{}',
    file_size INTEGER DEFAULT 0,
    source generation_source NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_library_items_user_id ON library_items(user_id);
CREATE INDEX idx_library_items_created_at ON library_items(created_at DESC);
CREATE INDEX idx_library_items_media_type ON library_items(media_type);

-- Enable RLS
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
```

---

## RLS Policies

### `library_items` Table

```sql
-- SELECT: View own items
CREATE POLICY "Users can view own library items"
ON library_items FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Create own items
CREATE POLICY "Users can insert own library items"
ON library_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- DELETE: Remove own items
CREATE POLICY "Users can delete own library items"
ON library_items FOR DELETE
USING (auth.uid() = user_id);
```

### Storage Bucket `user-media`

```sql
-- Create private bucket (via Supabase Dashboard or SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-media', 'user-media', false);

-- SELECT: View own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'user-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- INSERT: Upload to own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'user-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE: Delete own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'user-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Metadata JSONB Structure

```typescript
interface LibraryItemMetadata {
    prompt?: string;           // User/generated prompt
    model?: string;            // AI model used (e.g., 'gemini-2.0-flash-exp')
    seed?: number;             // Generation seed (if available)
    aspect_ratio?: string;     // e.g., '1:1', '9:16'
    style?: string;            // e.g., 'studio', 'lifestyle'
    platform?: string;         // e.g., 'amazon', 'instagram'
    duration_seconds?: number; // For videos only
}
```

---

## Storage Path Convention

```
user-media/
└── {user_id}/
    ├── {timestamp}-{random}.png     # Images
    ├── {timestamp}-{random}.mp4     # Videos
    └── ...
```

Example: `user-media/a1b2c3d4-e5f6-7890-abcd-ef1234567890/1736621234567-x7k9m.png`
