<!--
==========================================================
SYNC IMPACT REPORT
==========================================================
Version change: 1.0.0 → 1.1.0 (MINOR - added Vercel AI SDK requirement)
Modified principles: 
  - I. AI-First Product Development (added AI SDK rule)
Added sections: N/A
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - compatible
  ✅ spec-template.md - compatible
  ✅ tasks-template.md - compatible
Follow-up TODOs: None
==========================================================
-->

# Snapperfect Constitution

## Core Principles

### I. AI-First Product Development

Все функции продукта ДОЛЖНЫ использовать AI-генерацию как основной механизм создания ценности для пользователя.

**Правила:**
- Каждый модуль ДОЛЖЕН интегрировать как минимум один AI-сервис (Gemini API)
- Для интеграции всех поддерживаемых AI-функций ДОЛЖЕН использоваться Vercel AI SDK
- AI-обработка ДОЛЖНА быть инкапсулирована в отдельные API-роуты (`/api/*`)
- Fallback-механизмы ДОЛЖНЫ быть реализованы для случаев недоступности AI
- Все AI-запросы ДОЛЖНЫ быть оптимизированы для минимизации latency

**Обоснование:** Snapperfect — это AI-платформа, и качество AI-интеграции напрямую определяет ценность продукта для пользователей.

### II. Marketplace-Centric Design

Все выходные изображения ДОЛЖНЫ быть оптимизированы для публикации на маркетплейсах.

**Правила:**
- Поддержка preset-ов для платформ: Amazon, eBay, Etsy, Shopify, Instagram, TikTok, Pinterest, Facebook, Alibaba, Walmart
- Автоматическая адаптация соотношения сторон под требования платформы
- Стилевые рекомендации ДОЛЖНЫ соответствовать гайдлайнам каждой платформы
- Качество изображений ДОЛЖНО соответствовать минимальным требованиям платформ

**Обоснование:** Целевая аудитория — продавцы на маркетплейсах, которым нужны изображения, готовые к публикации без дополнительной обработки.

### III. Premium UX Standards

Интерфейс ДОЛЖЕН соответствовать премиальному уровню дизайна.

**Правила:**
- Используется тёмная тема с неоновыми акцентами (primary: #D4FF00, accent: #FF0099)
- Все интерактивные элементы ДОЛЖНЫ иметь hover/active состояния
- Drag-and-drop и paste-from-clipboard ДОЛЖНЫ поддерживаться для загрузки изображений
- Анимации ДОЛЖНЫ быть плавными (transition-duration: 200-500ms)
- Компоненты ДОЛЖНЫ быть responsive (mobile-first подход)
- Минимальный viewport: 320px, оптимальный: 1440px

**Обоснование:** Премиальный UX является конкурентным преимуществом и оправдывает ценность продукта.

### IV. Component-First Architecture

Код ДОЛЖЕН быть организован по модульному принципу с переиспользуемыми компонентами.

**Правила:**
- Общие UI-компоненты ДОЛЖНЫ находиться в `app/components/`
- Модуль-специфичные компоненты ДОЛЖНЫ находиться в `app/[module]/components/`
- API-роуты ДОЛЖНЫ быть изолированы в `app/api/[module]/`
- Страницы ДОЛЖНЫ быть в `app/[module]/page.tsx`
- TypeScript interfaces ДОЛЖНЫ быть определены для всех props и state

**Обоснование:** Модульная архитектура обеспечивает масштабируемость и поддерживаемость кодовой базы.

### V. Performance-First Approach

Приложение ДОЛЖНО обеспечивать быстрый отклик даже при AI-обработке.

**Правила:**
- First Contentful Paint (FCP) ДОЛЖЕН быть < 1.5s
- Изображения ДОЛЖНЫ использовать Next.js Image с lazy loading
- AI-обработка ДОЛЖНА показывать состояние загрузки (shimmer, spinner)
- 3D-компоненты ДОЛЖНЫ использовать dynamic import с SSR: false
- Bundle size ДОЛЖЕН быть минимизирован через tree-shaking

**Обоснование:** Пользователи ожидают мгновенный отклик интерфейса, даже если AI-обработка занимает время.

## Design System

Дизайн-система Snapperfect определяет визуальные стандарты:

**Цветовая палитра:**
- Background: #050505, #09090b, #0a0a0a, #121212
- Primary (Lime): #D4FF00
- Accent (Pink): #FF0099
- Text: white, #71717a (zinc-500), #52525b (zinc-600)
- Borders: rgba(255,255,255,0.05), #27272a

**Типографика:**
- Заголовки: font-black, uppercase, tracking-tight, italic
- Подписи: text-xs, font-bold, uppercase, tracking-wider

**Компоненты:**
- Карточки: rounded-2xl/rounded-3xl, border border-zinc-800/border-white/5
- Кнопки: rounded-xl, font-black, uppercase, tracking-wider
- Модальные окна: backdrop-blur-sm, bg-black/90

**Анимации:**
- Transitions: 200-500ms ease
- Hover: scale, opacity, border-color changes
- Loading: shimmer effect, animate-spin

## Development Workflow

Процесс разработки для Snapperfect:

**Stack:**
- Next.js 16+ с App Router
- React 19+ с Server Components где возможно
- TypeScript (strict mode)
- TailwindCSS 4 для стилей
- Lucide React для иконок
- React Three Fiber для 3D-компонентов

**Структура проекта:**
```
app/
├── api/           # API routes для AI-обработки
├── components/    # Общие компоненты (Sidebar и др.)
├── [module]/      # Модули: generate, product-enhance, angles, relight и др.
│   ├── page.tsx
│   └── components/
public/
├── assets/        # Статические изображения
└── avatar/        # Пользовательские аватары
```

**Git Workflow:**
- Main branch: `main`
- Feature branches: `feature/[module-name]`
- Коммиты: conventional commits (feat:, fix:, docs:, style:, refactor:)

## Governance

Конституция Snapperfect является главным документом, определяющим архитектурные и UX-решения.

**Правила внесения изменений:**
- Любое изменение принципов требует обновления версии конституции
- MAJOR: удаление или переопределение принципов
- MINOR: добавление новых принципов или секций
- PATCH: уточнения формулировок, исправление опечаток

**Compliance:**
- Все PR ДОЛЖНЫ соответствовать принципам конституции
- Code review ДОЛЖЕН включать проверку на соответствие Design System
- AI-интеграции ДОЛЖНЫ проходить проверку на соответствие Principle I

**Руководство для разработки:** Используйте `.specify/` для спецификаций и планов разработки.

**Version**: 1.1.0 | **Ratified**: 2026-01-09 | **Last Amended**: 2026-01-09
