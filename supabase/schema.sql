-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  created_at timestamptz default now() not null
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text,
  image_url text,
  created_at timestamptz default now() not null
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  value smallint not null check (value in (-1, 1)),
  unique (user_id, post_id)
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "Users can delete own posts"
  on public.posts for delete using (auth.uid() = user_id);

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete using (auth.uid() = user_id);

create policy "Votes are viewable by everyone"
  on public.votes for select using (true);

create policy "Authenticated users can vote"
  on public.votes for insert with check (auth.uid() = user_id);

create policy "Users can update own votes"
  on public.votes for update using (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.votes for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := coalesce(
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'preferred_username',
    new.raw_user_meta_data ->> 'user_name',
    new.raw_user_meta_data ->> 'nickname',
    split_part(coalesce(new.email, ''), '@', 1),
    'user'
  );
  base := lower(regexp_replace(base, '[^a-zA-Z0-9_]', '', 'g'));
  if length(base) < 3 then
    base := 'user' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;
  base := left(base, 20);
  candidate := base;
  while exists (
    select 1 from public.profiles where username = candidate
  ) loop
    n := n + 1;
    candidate := left(base, 16) || n::text;
  end loop;

  insert into public.profiles (id, username)
  values (new.id, candidate);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit)
values ('posts', 'posts', true, 52428800)
on conflict (id) do update
set file_size_limit = excluded.file_size_limit;

create policy "Anyone can view post images"
  on storage.objects for select
  using (bucket_id = 'posts');

create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (bucket_id = 'posts' and auth.role() = 'authenticated');

create table if not exists public.presence (
  visitor_id text primary key,
  last_seen timestamptz default now() not null
);

alter table public.presence enable row level security;

create policy "Anyone can read presence"
  on public.presence for select
  using (true);

create policy "Anyone can upsert presence"
  on public.presence for insert
  with check (true);

create policy "Anyone can update presence"
  on public.presence for update
  using (true);

create table if not exists public.winks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

create index if not exists winks_user_created on public.winks (user_id, created_at desc);
create index if not exists winks_created on public.winks (created_at desc);

alter table public.winks enable row level security;

create policy "Winks are viewable by everyone"
  on public.winks for select using (true);

create policy "Authenticated users can wink"
  on public.winks for insert with check (auth.uid() = user_id);
