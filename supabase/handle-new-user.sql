-- Paste in Supabase SQL Editor so Google/Naver users get a unique username.

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
