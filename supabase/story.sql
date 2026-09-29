-- Story saves and True Night unlocks. Run in Supabase SQL Editor.

create table if not exists public.story_saves (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  node_id text not null,
  flags jsonb not null default '[]'::jsonb,
  meter int not null default 0,
  updated_at timestamptz default now() not null
);

alter table public.story_saves enable row level security;

drop policy if exists "Users can read own story save" on public.story_saves;
create policy "Users can read own story save"
  on public.story_saves for select using (auth.uid() = user_id);

drop policy if exists "Users can write own story save" on public.story_saves;
create policy "Users can write own story save"
  on public.story_saves for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own story save" on public.story_saves;
create policy "Users can update own story save"
  on public.story_saves for update using (auth.uid() = user_id);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  product text not null,
  created_at timestamptz default now() not null,
  unique (user_id, product)
);

alter table public.purchases enable row level security;

drop policy if exists "Users can read own purchases" on public.purchases;
create policy "Users can read own purchases"
  on public.purchases for select using (auth.uid() = user_id);
