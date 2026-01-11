# Research: User Auth & Profiles

**Feature**: `003-supabase-auth`
**Status**: In Progress

## 1. Supabase Auth with Next.js App Router

**Goal**: Seamless server-side and client-side auth.

- **Library**: `@supabase/ssr` is the current standard for Next.js App Router (replacing `auth-helpers-nextjs`).
- **Pattern**:
    - `middleware.ts`: Refreshes session.
    - `lib/supabase/server.ts`: `createServerClient` with cookie handling for Server Components/Actions.
    - `lib/supabase/client.ts`: `createBrowserClient` for Client Components.
- **Decision**: Use `@supabase/ssr`.

## 2. RLS Policies for Profiles

**Goal**: Users only access their own data.

- **Table**: `profiles` (id, full_name, avatar_url, tier).
- **Policies**:
    - SELECT: `auth.uid() = id`
    - UPDATE: `auth.uid() = id`
    - INSERT: Handled by trigger, so maybe no INSERT policy for users, or `auth.uid() = id` if client creation allowed (Trigger is safer).
- **Triggers**:
    - Function `handle_new_user()` triggered `after insert on auth.users`.
    - Inserts into `public.profiles`.

## 3. Middleware Integration

**Goal**: Protect /account routes.

- **Logic**:
    - Update session FIRST (required by Supabase).
    - Check `user` object.
    - If no user and trying to access `/account*`, redirect to `/login`.
    - If user exists and trying to access `/login` or `/register`, redirect to `/account`.

## 4. UI/UX (Constitution)

- **Login/Register**:
    - Needs `app/(auth)/layout.tsx` for common styling.
    - Use "Glassmorphism" as per Premium UX.
    - Neon accents (#D4FF00, #FF0099).

## Decision Record

- **Auth Lib**: `@supabase/ssr`
- **DB Pattern**: `profiles` table + Trigger
- **Auth Flow**: PKCE (handled by Supabase lib automatically)
