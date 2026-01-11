-- Create Enums
create type public.tier_type as enum ('free', 'pro');

-- Create Profiles Table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  tier public.tier_type default 'free'::public.tier_type,
  updated_at timestamp with time zone,
  primary key (id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create Policies
create policy "Users can view own profile" 
on public.profiles for select 
using ( auth.uid() = id );

create policy "Users can update own profile" 
on public.profiles for update 
using ( auth.uid() = id );

-- Create Trigger Function
create function public.handle_new_user() 
returns trigger 
language plpgsql 
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Create Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
