-- BlackSmile Links. Run in the Supabase SQL Editor, then run handle-new-user.sql.

-- Profiles (one per auth user, filled by the handle_new_user trigger).
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  created_at timestamptz default now() not null
);

alter table public.profiles add column if not exists display_name text not null default '';
alter table public.profiles add column if not exists bio text not null default '';

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username ~ '^[a-z0-9_]{3,20}$') not valid;
alter table public.profiles drop constraint if exists profiles_text_lengths;
alter table public.profiles add constraint profiles_text_lengths
  check (char_length(display_name) <= 60 and char_length(bio) <= 280);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Links: each one is a short link at /l/<slug> and can also appear on the owner's /@username page.
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  slug text not null unique check (slug ~ '^[A-Za-z0-9_-]{3,32}$'),
  url text not null check (url ~* '^https?://' and char_length(url) <= 2048),
  title text not null default '' check (char_length(title) <= 100),
  on_page boolean not null default true,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz default now() not null
);

create index if not exists links_owner_position_idx on public.links (owner_id, position);

alter table public.links enable row level security;

drop policy if exists "Owners read links" on public.links;
create policy "Owners read links" on public.links for select using (auth.uid() = owner_id);
drop policy if exists "Owners create links" on public.links;
create policy "Owners create links" on public.links for insert with check (auth.uid() = owner_id);
drop policy if exists "Owners update links" on public.links;
create policy "Owners update links" on public.links for update using (auth.uid() = owner_id);
drop policy if exists "Owners delete links" on public.links;
create policy "Owners delete links" on public.links for delete using (auth.uid() = owner_id);

-- Clicks and page views. Written only through the security definer functions below.
create table if not exists public.clicks (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.links on delete cascade,
  source text not null default 'short' check (source in ('short', 'page')),
  referrer text,
  country text,
  device text,
  created_at timestamptz default now() not null
);

create index if not exists clicks_link_time_idx on public.clicks (link_id, created_at desc);

alter table public.clicks enable row level security;

drop policy if exists "Owners read clicks" on public.clicks;
create policy "Owners read clicks" on public.clicks for select using (
  exists (select 1 from public.links l where l.id = link_id and l.owner_id = auth.uid())
);

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users on delete cascade,
  referrer text,
  country text,
  device text,
  created_at timestamptz default now() not null
);

create index if not exists page_views_owner_time_idx on public.page_views (owner_id, created_at desc);

alter table public.page_views enable row level security;

drop policy if exists "Owners read page views" on public.page_views;
create policy "Owners read page views" on public.page_views for select using (auth.uid() = owner_id);

-- Public: resolve a short link and record the click in one round trip.
create or replace function public.follow_link(
  p_slug text,
  p_source text default 'short',
  p_referrer text default null,
  p_country text default null,
  p_device text default null,
  p_count boolean default true
)
returns text
language plpgsql
security definer set search_path = ''
as $$
declare
  target public.links%rowtype;
begin
  select * into target from public.links where slug = p_slug and active limit 1;
  if not found then
    return null;
  end if;
  if p_count then
    insert into public.clicks (link_id, source, referrer, country, device)
    values (
      target.id,
      case when p_source = 'page' then 'page' else 'short' end,
      left(p_referrer, 255),
      left(p_country, 8),
      left(p_device, 16)
    );
  end if;
  return target.url;
end;
$$;

-- Public: everything needed to render /@username.
create or replace function public.public_page(p_username text)
returns jsonb
language sql
stable
security definer set search_path = ''
as $$
  select jsonb_build_object(
    'username', p.username,
    'display_name', p.display_name,
    'bio', p.bio,
    'links', coalesce((
      select jsonb_agg(jsonb_build_object('slug', l.slug, 'title', l.title, 'url', l.url)
                       order by l.position, l.created_at)
      from public.links l
      where l.owner_id = p.id and l.active and l.on_page
    ), '[]'::jsonb)
  )
  from public.profiles p
  where p.username = lower(p_username)
  limit 1;
$$;

create or replace function public.record_page_view(
  p_username text,
  p_referrer text default null,
  p_country text default null,
  p_device text default null
)
returns void
language sql
security definer set search_path = ''
as $$
  insert into public.page_views (owner_id, referrer, country, device)
  select p.id, left(p_referrer, 255), left(p_country, 8), left(p_device, 16)
  from public.profiles p
  where p.username = lower(p_username);
$$;

-- Owner analytics. Security invoker, so row level security limits results to the caller's data.
create or replace function public.link_clicks(p_since timestamptz)
returns table (link_id uuid, clicks bigint)
language sql
stable
set search_path = ''
as $$
  select c.link_id, count(*) from public.clicks c
  where c.created_at >= p_since
  group by c.link_id;
$$;

create or replace function public.click_series(
  p_since timestamptz,
  p_link uuid default null,
  p_tz text default 'Asia/Seoul'
)
returns table (day date, clicks bigint)
language sql
stable
set search_path = ''
as $$
  select (c.created_at at time zone p_tz)::date, count(*) from public.clicks c
  where c.created_at >= p_since and (p_link is null or c.link_id = p_link)
  group by 1
  order by 1;
$$;

create or replace function public.click_breakdown(
  p_since timestamptz,
  p_dim text,
  p_link uuid default null
)
returns table (value text, clicks bigint)
language sql
stable
set search_path = ''
as $$
  select
    case p_dim
      when 'referrer' then coalesce(c.referrer, 'Direct')
      when 'country' then coalesce(c.country, 'Unknown')
      when 'device' then coalesce(c.device, 'Unknown')
      else c.source
    end,
    count(*)
  from public.clicks c
  where c.created_at >= p_since and (p_link is null or c.link_id = p_link)
  group by 1
  order by 2 desc
  limit 8;
$$;

create or replace function public.page_view_count(p_since timestamptz)
returns bigint
language sql
stable
set search_path = ''
as $$
  select count(*) from public.page_views v
  where v.owner_id = auth.uid() and v.created_at >= p_since;
$$;
