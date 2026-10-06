-- BlackSmile Shield. Run in the Supabase SQL Editor, then run handle-new-user.sql.

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

-- Signatures. No policies: only the service role (signature sync) and the
-- security definer lookup functions below can touch these tables.
create table if not exists public.malware_hashes (
  sha256 text primary key check (sha256 ~ '^[0-9a-f]{64}$'),
  md5 text,
  family text,
  file_type text,
  source text not null default 'malwarebazaar',
  first_seen timestamptz,
  added_at timestamptz default now() not null
);

alter table public.malware_hashes enable row level security;

create table if not exists public.malicious_urls (
  url text primary key,
  host text not null,
  threat text,
  tags text,
  source text not null default 'urlhaus',
  first_seen timestamptz,
  added_at timestamptz default now() not null
);

create index if not exists malicious_urls_host_idx on public.malicious_urls (host);

alter table public.malicious_urls enable row level security;

insert into public.malware_hashes (sha256, family, file_type, source)
values ('275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f', 'EICAR-Test-File', 'txt', 'builtin')
on conflict (sha256) do nothing;

-- Scan history (only for signed-in users; files themselves are never uploaded).
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null check (kind in ('file', 'url')),
  target text not null check (char_length(target) <= 2048),
  sha256 text check (sha256 is null or sha256 ~ '^[0-9a-f]{64}$'),
  size bigint,
  verdict text not null check (verdict in ('clean', 'suspicious', 'malicious')),
  score integer not null default 0,
  findings jsonb not null default '[]'::jsonb,
  created_at timestamptz default now() not null
);

create index if not exists scans_owner_time_idx on public.scans (owner_id, created_at desc);

alter table public.scans enable row level security;

drop policy if exists "Owners read scans" on public.scans;
create policy "Owners read scans" on public.scans for select using (auth.uid() = owner_id);
drop policy if exists "Owners create scans" on public.scans;
create policy "Owners create scans" on public.scans for insert with check (auth.uid() = owner_id);
drop policy if exists "Owners delete scans" on public.scans;
create policy "Owners delete scans" on public.scans for delete using (auth.uid() = owner_id);

-- Public lookups.
create or replace function public.lookup_hashes(p_hashes text[])
returns table (sha256 text, family text, file_type text, first_seen timestamptz)
language sql
stable
security definer set search_path = ''
as $$
  select h.sha256, h.family, h.file_type, h.first_seen
  from public.malware_hashes h
  where h.sha256 = any (p_hashes[1:200]);
$$;

create or replace function public.lookup_url(p_url text, p_host text)
returns table (url text, threat text, tags text, exact boolean)
language sql
stable
security definer set search_path = ''
as $$
  (select u.url, u.threat, u.tags, true from public.malicious_urls u where u.url = p_url limit 1)
  union all
  (select u.url, u.threat, u.tags, false from public.malicious_urls u
   where u.host = lower(p_host) and u.url <> p_url
   order by u.first_seen desc nulls last limit 5);
$$;

create or replace function public.signature_stats()
returns jsonb
language sql
stable
security definer set search_path = ''
as $$
  select jsonb_build_object(
    'hashes', (select count(*) from public.malware_hashes),
    'urls', (select count(*) from public.malicious_urls),
    'updated_at', greatest(
      (select max(added_at) from public.malware_hashes where source <> 'builtin'),
      (select max(added_at) from public.malicious_urls)
    )
  );
$$;
