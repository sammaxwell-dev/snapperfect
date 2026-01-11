# Quickstart: User Media Library

## Prerequisites

- Supabase проект настроен (см. 003-supabase-auth)
- Аутентификация работает
- Доступ к Supabase Dashboard

---

## Step 1: Применить SQL Schema

1. Откройте Supabase Dashboard → SQL Editor
2. Выполните содержимое файла `contracts/schema.sql`
3. Проверьте:
   - Таблица `library_items` создана
   - RLS включен
   - Бакет `user-media` создан (приватный)

---

## Step 2: Проверить Storage Policies

1. Dashboard → Storage → Policies
2. Убедитесь что для `user-media` есть 3 политики:
   - `Users can view own media files` (SELECT)
   - `Users can upload to own media folder` (INSERT)
   - `Users can delete own media files` (DELETE)

---

## Step 3: Создать API Routes

### Файловая структура

```
app/
├── api/
│   └── library/
│       ├── route.ts           # GET /api/library
│       ├── [id]/
│       │   └── route.ts       # GET/DELETE /api/library/[id]
│       ├── batch/
│       │   └── route.ts       # DELETE /api/library/batch
│       └── usage/
│           └── route.ts       # GET /api/library/usage
├── library/
│   ├── page.tsx               # Страница библиотеки
│   └── components/
│       ├── LibraryGrid.tsx    # Сетка элементов
│       ├── LibraryItem.tsx    # Карточка элемента
│       ├── ItemModal.tsx      # Модальное окно деталей
│       └── UsageIndicator.tsx # Индикатор хранилища
└── lib/
    └── library/
        └── save-to-library.ts # Helper для сохранения
```

---

## Step 4: Интегрировать сохранение

Добавить вызов `saveToLibrary()` в:
- `/api/product-enhance/route.ts`
- `/api/fashion-motion/route.ts`
- `/api/generate/route.ts`
- `/api/angles/route.ts`

---

## Step 5: Добавить навигацию

Добавить ссылку "My Library" в Sidebar.

---

## Verification Checklist

- [ ] Таблица `library_items` существует
- [ ] RLS политики активны
- [ ] Бакет `user-media` приватный
- [ ] Storage policies настроены
- [ ] API routes отвечают
- [ ] Страница `/library` рендерится
- [ ] Генерация сохраняет в библиотеку
- [ ] Пользователь видит только свой контент
