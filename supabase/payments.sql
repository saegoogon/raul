-- Full game payments (Toss + Stripe). Run in Supabase SQL Editor after story.sql.
-- Rows are written only by the server with the service role key.

create table if not exists public.payment_orders (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product text not null,
  provider text not null check (provider in ('toss', 'stripe')),
  amount int not null,
  currency text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  payment_key text,
  created_at timestamptz default now() not null,
  paid_at timestamptz
);

create index if not exists payment_orders_user_idx on public.payment_orders (user_id);

alter table public.payment_orders enable row level security;

drop policy if exists "Users can read own orders" on public.payment_orders;
create policy "Users can read own orders"
  on public.payment_orders for select using (auth.uid() = user_id);
