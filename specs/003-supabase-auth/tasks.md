# Tasks: User Auth & Profiles

**Feature**: `User Auth & Profiles`
**Branch**: `003-supabase-auth`

## Phase 1: Setup

> **Goal**: Initialize Supabase environment and dependencies.

- [x] T001 Install Supabase packages (`@supabase/ssr`, `@supabase/supabase-js`) in `package.json`
- [x] T002 Create Supabase Browser Client in `lib/supabase/client.ts`
- [x] T003 Create Supabase Server Client in `lib/supabase/server.ts`
- [x] T004 Create Auth Middleware utility in `lib/supabase/middleware.ts`
- [x] T005 Apply SQL Schema (Tables, Triggers, RLS) from `specs/003-supabase-auth/contracts/schema.sql` to Supabase

## Phase 2: Foundational

> **Goal**: Core application integration.

- [x] T006 Implement Global Middleware in `middleware.ts`
- [x] T007 Create Auth Layout in `app/(auth)/layout.tsx` (Glassmorphism, Neon styles)

## Phase 3: User Story 1 - Register & Login

> **Goal**: Users can sign up and log in.
> **Test**: Manual registration flow -> Redirect to /account.

- [x] T008 [US1] Create Login Page in `app/(auth)/login/page.tsx`
- [x] T009 [US1] Create Register Page in `app/(auth)/register/page.tsx`
- [x] T010 [US1] Implement Auth Callback route in `app/(auth)/callback/route.ts`
- [x] T011 [US1] Implement Server Actions for Login/Signup (in `app/(auth)/actions.ts` or similar)

## Phase 4: User Story 2 - Profile Management

> **Goal**: Users can view and edit their profile.
> **Test**: Update name/avatar and see changes persist.

- [x] T012 [US2] Create Account Page in `app/account/page.tsx`
- [x] T013 [US2] Implement "Update Profile" Server Action in `app/account/actions.ts`
- [x] T014 [US2] Update Sidebar User Component in `app/sidebar-user.tsx` to show real user data

## Phase 5: User Story 3 - Access Control & Pro Tier

> **Goal**: Data security and Pro tier stub.
> **Test**: RLS blocks unauthorized access; Mock button toggles Pro status.

- [x] T015 [US3] Verify RLS Policies are active (Task for verification)
- [x] T016 [US3] Create "Upgrade to Pro" Mock Component in `app/account/pro-toggle.tsx`
- [x] T017 [US3] Implement "Toggle Tier" Server Action (Mock) in `app/account/actions.ts`

## Final Phase: Polish

> **Goal**: Visual refinement and error handling.

- [x] T018 Add loading states for Auth forms in `app/(auth)/login/page.tsx` and `register/page.tsx`
- [x] T019 Add error toast notifications for failed actions in `app/(auth)/actions.ts`
