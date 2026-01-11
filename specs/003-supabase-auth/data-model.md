# Data Model: User Auth & Profiles

## Entities

### `auth.users` (Supabase System Table)
- **Description**: Stores authentication credentials (email/password).
- **Key Fields**: `id` (PK, UUID), `email`, `encrypted_password`.
- **Relationships**: One-to-One with `public.profiles`.

### `public.profiles`
- **Description**: Extended user profile data.
- **Key Fields**:
    - `id` (PK, UUID, FK -> `auth.users.id`): Primary key, matches auth user ID.
    - `full_name` (Text): Display name.
    - `avatar_url` (Text): URL to avatar image.
    - `tier` (Enum: `tier_type` -> 'free', 'pro'): Subscription status. Default 'free'.
    - `updated_at` (Timestamp with time zone): Last update time.

## Enums

- **`tier_type`**: `['free', 'pro']`

## Triggers

1.  **`on_auth_user_created`**:
    - **Trigger**: AFTER INSERT ON `auth.users`
    - **Action**: Inserts new row into `public.profiles` with `id`, `email`, `full_name` (from metadata), `avatar_url` (from metadata).

## RLS Policies (`public.profiles`)

1.  **View Own Profile**:
    - `SELECT`
    - `USING ( auth.uid() = id )`
    
2.  **Update Own Profile**:
    - `UPDATE`
    - `USING ( auth.uid() = id )`
    - `WITH CHECK ( auth.uid() = id )`

3.  **Read Others (Optional/Future)**:
    - Currently NOT enabled based on spec SC-002 ("100% requests to other profiles blocked").
