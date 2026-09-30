-- BlackSmile Cloud. Run in the Supabase SQL Editor, then run handle-new-user.sql.

-- Profiles (one per auth user, filled by the handle_new_user trigger).
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Drive: files and folders. Files live in the private "drive" bucket at <owner_id>/<item_id>.
create table if not exists public.drive_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.drive_items(id) on delete cascade,
  kind text not null check (kind in ('folder', 'file')),
  name text not null check (char_length(name) between 1 and 255),
  size bigint not null default 0,
  mime text,
  storage_path text unique,
  share_token text unique,
  trashed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists drive_items_owner_parent_idx on public.drive_items (owner_id, parent_id);
create index if not exists drive_items_owner_trashed_idx on public.drive_items (owner_id, trashed_at);

alter table public.drive_items enable row level security;

drop policy if exists "Owners read items" on public.drive_items;
create policy "Owners read items"
  on public.drive_items for select using (auth.uid() = owner_id);

drop policy if exists "Owners create items" on public.drive_items;
create policy "Owners create items"
  on public.drive_items for insert with check (auth.uid() = owner_id);

drop policy if exists "Owners update items" on public.drive_items;
create policy "Owners update items"
  on public.drive_items for update using (auth.uid() = owner_id);

drop policy if exists "Owners delete items" on public.drive_items;
create policy "Owners delete items"
  on public.drive_items for delete using (auth.uid() = owner_id);

-- Private bucket, 50 MB per file (the Supabase free plan cap).
insert into storage.buckets (id, name, public, file_size_limit)
values ('drive', 'drive', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "Owners read drive objects" on storage.objects;
create policy "Owners read drive objects"
  on storage.objects for select
  using (bucket_id = 'drive' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners upload drive objects" on storage.objects;
create policy "Owners upload drive objects"
  on storage.objects for insert
  with check (bucket_id = 'drive' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners delete drive objects" on storage.objects;
create policy "Owners delete drive objects"
  on storage.objects for delete
  using (bucket_id = 'drive' and (storage.foldername(name))[1] = auth.uid()::text);
