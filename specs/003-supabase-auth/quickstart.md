# Quickstart: User Auth

## Prerequisites

- Supabase project created.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env`.

## Setup DB

1. Go to Supabase Dashboard -> SQL Editor.
2. Run the content of `specs/003-supabase-auth/contracts/schema.sql`.

## Feature Flags

- **Pro Mode**: Implementation uses a mock toggle. No real payment yet.

## Testing

1. **Register**: Go to `/login`, switch to "Sign Up". Enter email/pass.
2. **Verify Redirect**: Should land on `/account`.
3. **Verify Data**: Check `profiles` table in Supabase Dashboard.
4. **Pro Mode**: Click "Upgrade to Pro" in `/account`. Refresh. Check `tier` column.
