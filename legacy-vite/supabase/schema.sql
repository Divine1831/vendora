-- VENDORA initial MVP schema
-- Run this in Supabase SQL Editor. Review before using with real customer data.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  category text,
  description text,
  phone text,
  currency text not null default 'NGN',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null default 0 check (price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text,
  customer_email text,
  total numeric(12,2) not null default 0 check (total >= 0),
  status text not null default 'pending' check (status in ('pending','paid','processing','shipped','completed','cancelled','failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0)
);

create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
create index if not exists products_business_id_idx on public.products(business_id);
create index if not exists orders_business_id_idx on public.orders(business_id);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

drop policy if exists "Owners manage own businesses" on public.businesses;
create policy "Owners manage own businesses" on public.businesses for all to authenticated
using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "Owners manage products in own businesses" on public.products;
create policy "Owners manage products in own businesses" on public.products for all to authenticated
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "Owners manage orders in own businesses" on public.orders;
create policy "Owners manage orders in own businesses" on public.orders for all to authenticated
using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "Owners view order items in own businesses" on public.order_items;
create policy "Owners view order items in own businesses" on public.order_items for select to authenticated
using (exists (
  select 1 from public.orders o join public.businesses b on b.id = o.business_id
  where o.id = order_id and b.owner_id = auth.uid()
));

-- Public storefront policies and checkout functions should be added deliberately
-- before enabling public store browsing or accepting real orders.
