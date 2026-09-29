-- Run this in the Supabase SQL Editor so winks can score tonight.

create table if not exists public.winks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

create index if not exists winks_user_created on public.winks (user_id, created_at desc);
create index if not exists winks_created on public.winks (created_at desc);

alter table public.winks enable row level security;

drop policy if exists "Winks are viewable by everyone" on public.winks;
create policy "Winks are viewable by everyone"
  on public.winks for select using (true);

drop policy if exists "Authenticated users can wink" on public.winks;
create policy "Authenticated users can wink"
  on public.winks for insert with check (auth.uid() = user_id);
