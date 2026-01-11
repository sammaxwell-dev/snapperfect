# Feature Specification: User Media Library

**Feature Branch**: `004-user-media-library`  
**Created**: 2026-01-11  
**Status**: Revised (Incorporating Best Practices)
**Input**: User description: "Сохранение изображений и видео в библиотеке пользователя с использованием лучших практик"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Автоматическое сохранение сгенерированного контента (Priority: P1)

После генерации изображения или видео система автоматически сохраняет результат в персональную библиотеку. 

**Why this priority**: Это ядро функции. Пользователи ожидают, что результат работы не пропадет.

**Independent Test**: Сгенерировать изображение и проверить его наличие в `My Library` с корректными данными.

**Acceptance Scenarios**:

1. **Given** авторизованный пользователь, **When** генерация (Product Enhance/Fashion Motion) завершена, **Then** запись создается в БД ДО ответа клиенту, а файл загружается в приватный бакет Supabase.
2. **Given** сбой при сохранении в БД, **When** генерация успешна, **Then** пользователю показывается предупреждение "Saved locally, but failed to sync to cloud", давая возможность скачать файл вручную.

---

### User Story 2 - Просмотр и пагинация библиотеки (Priority: P1)

Пользователь видит свои работы в виде сетки с оптимизированной загрузкой.

**Acceptance Scenarios**:

1. **Given** 100+ элементов, **When** пользователь открывает библиотеку, **Then** загружаются первые 20 элементов (с превью), остальные подгружаются при скролле.
2. **Given** видео в списке, **When** пользователь смотрит на сетку, **Then** он видит статичное превью (thumbnail) с иконкой "Play", чтобы не нагружать трафик.

---

### User Story 3 - Детальный просмотр и "Remix" (Priority: P2)

Просмотр деталей генерации (промпт, настройки).

**Acceptance Scenarios**:

1. **Given** открыт элемент, **When** пользователь нажимает "Show Details", **Then** отображается промпт, seed, модель и дата.
2. **Given** открыт элемент, **When** пользователь нажимает "Use Prompt", **Then** он перенаправляется в редактор с заполненными параметрами этого изображения.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Сохранение в приватный бакет `user-media` с иерархией `owner_id/file_name`.
- **FR-002**: Генерация JSON-метаданных: `{ prompt: string, seed: number, model: string, aspect_ratio: string, mode: string }`.
- **FR-003**: Система должна по возможности использовать Supabase Image Transformation для превью. Если тариф Free не поддерживает трансформацию, использовать `loading="lazy"` и оптимизированные форматы (WebP/AVIF).
- **FR-004**: Реализация Infinite Scroll (пагинация по 20 элементов).
- **FR-005**: Функция "Batch Delete" — удаление нескольких элементов одновременно (лимит: 20 за раз).
- **FR-006**: Отображение индикатора заполнения хранилища (напр. "Used 50MB of 1GB").

### Technical & Security Requirements

- **TR-001 (RLS)**: Включить Row Level Security для таблицы `library_items`. Политика: `(auth.uid() = user_id)`.
- **TR-002 (Storage Security)**: Доступ к файлам через `supabase.storage.from().createSignedUrl()` с TTL 1 час.
- **TR-003 (Atomic Transactions)**: Удаление записи из БД должно сопровождаться (или инициировать) удаление физического файла через edge function или серверный код.
- **TR-004 (Optimization)**: Все изображения в сетке должны иметь `loading="lazy"` и `srcset`.

### Key Entities

- **LibraryItem**: 
  - `id`: UUID
  - `user_id`: UUID (FK to auth.users)
  - `storage_path`: string (путь в бакете)
  - `media_type`: enum ('image', 'video')
  - `metadata`: jsonb (промпт, настройки)
  - `created_at`: timestamp
  - `file_size`: int (в байтах)

## Success Criteria *(mandatory)*

- **SC-001**: Page Load (LCP) < 1.5 сек для страницы библиотеки.
- **SC-002**: 100% защита данных (пользователь A не может получить доступ к `storage_path` пользователя B даже зная URL, так как бакет приватный).
- **SC-003**: Удаление 10 элементов занимает < 2 сек (UI feedback).

## Assumptions

- Бесплатный лимит 1GB на проект Supabase требует мониторинга.
- На Free Tier (без Image Transformation) превью видео могут требовать ручной загрузки первого кадра как отдельного файла при генерации.
- Пользователь всегда авторизован для доступа к странице `/library`.
