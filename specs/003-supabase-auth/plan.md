# Implementation Plan: User Auth & Profiles

**Branch**: `003-supabase-auth` | **Date**: 2026-01-11 | **Spec**: [specs/003-supabase-auth/spec.md](file:///Users/dwhitewolf/Work/MVP/snapperfect/specs/003-supabase-auth/spec.md)
**Input**: Feature specification from `specs/003-supabase-auth/spec.md`

## Summary

Implement user registration and authentication using Supabase Auth, integrated with Next.js App Router. Create a `profiles` table for user data (name, avatar, tier) that automatically syncs with `auth.users` via triggers. Implement "Free" and "Pro" tiers, where Pro status is toggled via a mock UI for MVP. Ensure strict data security using RLS policies.

## Technical Context

**Language/Version**: TypeScript 5+ (Next.js 16+)
**Primary Dependencies**: `@supabase/ssr` (for Next.js Auth), `@supabase/supabase-js`
**Storage**: Supabase (PostgreSQL)
**Testing**: Manual verification + Playwright (if available, otherwise manual)
**Target Platform**: Web (Vercel)
**Performance Goals**: Auth state check < 100ms
**Constraints**: Global design system consistency
**Scale/Scope**: MVP integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. AI-First**: N/A (Auth is utility).
- **II. Marketplace-Centric**: N/A.
- **III. Premium UX**: Login/Register pages must use "Premium UX Standards" (Dark theme, neon accents).
- **IV. Component-First**: Auth forms will be reusable components in `app/(auth)/components/`.
- **V. Performance-First**: Middleware will handle session checks efficiently.

## Project Structure

### Documentation (this feature)

```text
specs/003-supabase-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code

```text
app/
├── (auth)/                # Auth routes group
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── callback/          # Auth callback for SSR
│       └── route.ts
├── account/               # Protected user area
│   └── page.tsx
├── sidebar-user.tsx         # User component in sidebar
lib/
├── supabase/              # Supabase clients
│   ├── client.ts          # Browser client
│   ├── server.ts          # Server client
│   └── middleware.ts      # Auth middleware
middleware.ts              # Global middleware integration
```

**Structure Decision**: Using standard Supabase SSR pattern with `app/(auth)` route group to keep auth logic organized.
