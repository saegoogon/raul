-- BlackSmile snippets. Run this in the Supabase SQL Editor.
-- Needs public.profiles (see schema.sql + handle-new-user.sql).

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Anyone can read profiles" on public.profiles;
create policy "Anyone can read profiles"
  on public.profiles for select using (true);

create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  language text not null check (language in ('ts', 'js', 'py', 'go', 'rust', 'sql', 'css', 'html', 'json', 'text')),
  code text not null default '' check (char_length(code) <= 40000),
  note text not null default '' check (char_length(note) <= 8000),
  star_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz default now() not null
);

create index if not exists snippets_new_idx on public.snippets (created_at desc);
create index if not exists snippets_hot_idx on public.snippets (star_count desc, created_at desc);
create index if not exists snippets_lang_idx on public.snippets (language, created_at desc);

create table if not exists public.snippet_stars (
  user_id uuid not null references public.profiles(id) on delete cascade,
  snippet_id uuid not null references public.snippets(id) on delete cascade,
  primary key (user_id, snippet_id)
);

create table if not exists public.snippet_comments (
  id uuid primary key default gen_random_uuid(),
  snippet_id uuid not null references public.snippets(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.snippet_comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 8000),
  created_at timestamptz default now() not null
);

create index if not exists snippet_comments_idx on public.snippet_comments (snippet_id, created_at);

alter table public.snippets enable row level security;
alter table public.snippet_stars enable row level security;
alter table public.snippet_comments enable row level security;

drop policy if exists "Anyone reads snippets" on public.snippets;
create policy "Anyone reads snippets" on public.snippets for select using (true);
drop policy if exists "Members write snippets" on public.snippets;
create policy "Members write snippets" on public.snippets for insert with check (auth.uid() = author_id);

drop policy if exists "Anyone reads snippet stars" on public.snippet_stars;
create policy "Anyone reads snippet stars" on public.snippet_stars for select using (true);
drop policy if exists "Members star snippets" on public.snippet_stars;
create policy "Members star snippets" on public.snippet_stars for insert with check (auth.uid() = user_id);
drop policy if exists "Members unstar snippets" on public.snippet_stars;
create policy "Members unstar snippets" on public.snippet_stars for delete using (auth.uid() = user_id);

drop policy if exists "Anyone reads snippet comments" on public.snippet_comments;
create policy "Anyone reads snippet comments" on public.snippet_comments for select using (true);
drop policy if exists "Members write snippet comments" on public.snippet_comments;
create policy "Members write snippet comments" on public.snippet_comments for insert with check (auth.uid() = author_id);

create or replace function public.sync_snippet_stars()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.snippets
  set star_count = (select count(*) from public.snippet_stars where snippet_id = coalesce(new.snippet_id, old.snippet_id))
  where id = coalesce(new.snippet_id, old.snippet_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists snippet_stars_sync on public.snippet_stars;
create trigger snippet_stars_sync
after insert or delete on public.snippet_stars
for each row execute function public.sync_snippet_stars();

create or replace function public.sync_snippet_comments()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.snippets
  set comment_count = (select count(*) from public.snippet_comments where snippet_id = coalesce(new.snippet_id, old.snippet_id))
  where id = coalesce(new.snippet_id, old.snippet_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists snippet_comments_sync on public.snippet_comments;
create trigger snippet_comments_sync
after insert or delete on public.snippet_comments
for each row execute function public.sync_snippet_comments();

grant select on public.snippets, public.snippet_stars, public.snippet_comments to anon, authenticated;
grant insert on public.snippets, public.snippet_stars, public.snippet_comments to authenticated;
grant delete on public.snippet_stars to authenticated;
grant update on public.snippets to authenticated;

alter table public.snippets drop constraint if exists snippets_code_check;
alter table public.snippets drop constraint if exists snippets_note_check;
alter table public.snippets alter column code set default '';
alter table public.snippets add constraint snippets_code_check check (char_length(code) <= 40000);
alter table public.snippets add constraint snippets_note_check check (char_length(note) <= 8000);
