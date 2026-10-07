-- BlackSmile community. Run this in the Supabase SQL Editor.
-- Needs public.profiles (see schema.sql + handle-new-user.sql).

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Anyone can read profiles" on public.profiles;
create policy "Anyone can read profiles"
  on public.profiles for select using (true);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9_]{2,24}$'),
  name text not null check (char_length(name) between 2 and 40),
  description text not null default '' check (char_length(description) <= 280),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '' check (char_length(body) <= 20000),
  url text check (url is null or char_length(url) <= 2048),
  score integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz default now() not null
);

create index if not exists posts_room_time_idx on public.posts (room_id, created_at desc);
create index if not exists posts_hot_idx on public.posts (score desc, created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 8000),
  score integer not null default 0,
  created_at timestamptz default now() not null
);

create index if not exists comments_post_idx on public.comments (post_id, created_at);

create table if not exists public.post_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (user_id, post_id)
);

create table if not exists public.comment_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (user_id, comment_id)
);

alter table public.rooms enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_votes enable row level security;
alter table public.comment_votes enable row level security;

drop policy if exists "Anyone reads rooms" on public.rooms;
create policy "Anyone reads rooms" on public.rooms for select using (true);
drop policy if exists "Members make rooms" on public.rooms;
create policy "Members make rooms" on public.rooms for insert with check (auth.uid() = created_by);

drop policy if exists "Anyone reads posts" on public.posts;
create policy "Anyone reads posts" on public.posts for select using (true);
drop policy if exists "Members write posts" on public.posts;
create policy "Members write posts" on public.posts for insert with check (auth.uid() = author_id);
drop policy if exists "Authors update posts" on public.posts;
create policy "Authors update posts" on public.posts for update using (auth.uid() = author_id);

drop policy if exists "Anyone reads comments" on public.comments;
create policy "Anyone reads comments" on public.comments for select using (true);
drop policy if exists "Members write comments" on public.comments;
create policy "Members write comments" on public.comments for insert with check (auth.uid() = author_id);

drop policy if exists "Members read own post votes" on public.post_votes;
create policy "Members read own post votes" on public.post_votes for select using (auth.uid() = user_id);
drop policy if exists "Members vote posts" on public.post_votes;
create policy "Members vote posts" on public.post_votes for insert with check (auth.uid() = user_id);
drop policy if exists "Members change post votes" on public.post_votes;
create policy "Members change post votes" on public.post_votes for update using (auth.uid() = user_id);
drop policy if exists "Members drop post votes" on public.post_votes;
create policy "Members drop post votes" on public.post_votes for delete using (auth.uid() = user_id);

drop policy if exists "Members read own comment votes" on public.comment_votes;
create policy "Members read own comment votes" on public.comment_votes for select using (auth.uid() = user_id);
drop policy if exists "Members vote comments" on public.comment_votes;
create policy "Members vote comments" on public.comment_votes for insert with check (auth.uid() = user_id);
drop policy if exists "Members change comment votes" on public.comment_votes;
create policy "Members change comment votes" on public.comment_votes for update using (auth.uid() = user_id);
drop policy if exists "Members drop comment votes" on public.comment_votes;
create policy "Members drop comment votes" on public.comment_votes for delete using (auth.uid() = user_id);

create or replace function public.sync_post_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set score = coalesce((select sum(value) from public.post_votes where post_id = coalesce(new.post_id, old.post_id)), 0)
  where id = coalesce(new.post_id, old.post_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists post_votes_sync on public.post_votes;
create trigger post_votes_sync
after insert or update or delete on public.post_votes
for each row execute function public.sync_post_score();

create or replace function public.sync_comment_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.comments
  set score = coalesce((select sum(value) from public.comment_votes where comment_id = coalesce(new.comment_id, old.comment_id)), 0)
  where id = coalesce(new.comment_id, old.comment_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists comment_votes_sync on public.comment_votes;
create trigger comment_votes_sync
after insert or update or delete on public.comment_votes
for each row execute function public.sync_comment_score();

create or replace function public.sync_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set comment_count = (select count(*) from public.comments where post_id = coalesce(new.post_id, old.post_id))
  where id = coalesce(new.post_id, old.post_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists comments_count_sync on public.comments;
create trigger comments_count_sync
after insert or delete on public.comments
for each row execute function public.sync_comment_count();

insert into public.rooms (slug, name, description)
values
  ('lounge', 'Lounge', 'General discussion.'),
  ('night', 'Night', 'Late posts.'),
  ('seoul', 'Seoul', 'Seoul.'),
  ('grins', 'Grins', 'Jokes.'),
  ('ask', 'Ask', 'Questions.')
on conflict (slug) do nothing;

grant select on public.rooms, public.posts, public.comments to anon, authenticated;
grant select, insert, update, delete on public.post_votes, public.comment_votes to authenticated;
grant insert on public.rooms, public.posts, public.comments to authenticated;
grant update on public.posts, public.comments to authenticated;
