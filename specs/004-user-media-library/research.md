# Research: User Media Library

## Исследованные вопросы

### 1. Supabase Storage — приватный бакет vs публичный

**Decision**: Использовать **приватный бакет** `user-media`

**Rationale**: 
- Приватные бакеты по умолчанию защищены RLS-политиками
- Файлы доступны только через signed URLs или с авторизацией
- Соответствует требованию SC-002 (100% защита данных)

**Alternatives considered**:
- Публичный бакет с обфускацией путей — отклонено (URL можно угадать/перебрать)
- Публичный бакет + проверка на клиенте — отклонено (не защищает от прямых запросов)

---

### 2. Стратегия доступа к файлам — Signed URLs

**Decision**: Использовать `createSignedUrl()` с TTL 1 час

**Rationale**:
- Best practice для приватных бакетов
- Ограниченное время жизни минимизирует риск утечки
- Не требует передачи JWT в каждом запросе к CDN
- Supabase автоматически кеширует через CDN

**Implementation**:
```typescript
const { data, error } = await supabase.storage
  .from('user-media')
  .createSignedUrl(path, 3600) // 1 hour TTL
```

---

### 3. RLS-политики для `library_items`

**Decision**: Использовать `auth.uid() = user_id` для всех операций

**Policies**:
```sql
-- SELECT: пользователь видит только свои записи
CREATE POLICY "Users can view own library items"
ON library_items FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: пользователь может создавать только для себя
CREATE POLICY "Users can insert own library items"
ON library_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- DELETE: пользователь может удалять только свои записи
CREATE POLICY "Users can delete own library items"
ON library_items FOR DELETE
USING (auth.uid() = user_id);
```

---

### 4. RLS-политики для Storage

**Decision**: Политики на `storage.objects` с folder-based access

**Rationale**:
- Структура `{user_id}/filename.ext` позволяет простые RLS-политики
- Один user_id = одна папка = одна политика

**Policies**:
```sql
-- SELECT: пользователь может читать файлы из своей папки
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- INSERT: пользователь может загружать в свою папку
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE: пользователь может удалять свои файлы
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-media' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

### 5. Генерация превью (thumbnails)

**Decision**: Использовать Supabase Image Transformations (Pro план) ИЛИ клиентскую компрессию для Free Tier

**Rationale**:
- Free Tier не поддерживает on-the-fly трансформации
- Для MVP: сохранять уже сжатые изображения (клиентская компрессия перед загрузкой)
- Видео: использовать первый кадр как превью (генерировать на сервере при сохранении)

**Free Tier Workaround**:
- Компрессия на клиенте до ~200KB перед загрузкой
- Для видео: не генерировать превью, использовать placeholder + иконку play

---

### 6. Удаление файлов — атомарность

**Decision**: Серверное удаление через API route

**Rationale**:
- Клиентское удаление ненадёжно (вкладку могут закрыть)
- API route удаляет запись из БД И файл из Storage в одной транзакции
- При ошибке удаления файла — orphan cleanup через cron (future)

**Implementation**:
```typescript
// API: DELETE /api/library/[id]
const supabase = await createClient()
const { data: item } = await supabase.from('library_items').select('storage_path').eq('id', id).single()
await supabase.storage.from('user-media').remove([item.storage_path])
await supabase.from('library_items').delete().eq('id', id)
```

---

### 7. Интеграция с существующими API routes

**Decision**: Модифицировать `/api/product-enhance` и `/api/fashion-motion` для сохранения результата

**Rationale**:
- Минимальные изменения в существующем коде
- Добавляется вызов `saveToLibrary()` после успешной генерации
- Fallback: если сохранение не удалось, генерация всё равно возвращается клиенту

---

## Технологический стек

| Компонент | Технология |
|-----------|------------|
| Storage | Supabase Storage (private bucket) |
| Database | Supabase PostgreSQL |
| Access Control | RLS policies |
| File Access | Signed URLs (1h TTL) |
| Client | Next.js 16 + @supabase/ssr |
| UI Component | Custom grid с Infinite Scroll |
