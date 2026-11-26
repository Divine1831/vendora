-- Additive-compatible baseline for fresh Supabase projects.
-- Existing schema.sql + migration_vendora_2.sql are retained under legacy-vite/.
create extension if not exists pgcrypto;

do $$ begin
  create type public.order_status as enum ('pending','paid','processing','shipped','completed','cancelled','failed');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug varchar(80) not null unique,
  category text,
  description text,
  phone text,
  currency varchar(3) not null default 'NGN',
  created_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null default 0 check(price >= 0),
  stock_quantity integer not null default 0 check(stock_quantity >= 0),
  image_url text,
  category text not null default 'General',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text,
  customer_email text,
  total numeric(12,2) not null default 0 check(total >= 0),
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check(quantity > 0),
  unit_price numeric(12,2) not null check(unit_price >= 0)
);
create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
create index if not exists products_business_id_idx on public.products(business_id);
create index if not exists orders_business_id_idx on public.orders(business_id);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Vendora profile owner" on public.profiles;
create policy "Vendora profile owner" on public.profiles for all to authenticated using(id=auth.uid()) with check(id=auth.uid());
drop policy if exists "Vendora business owner" on public.businesses;
create policy "Vendora business owner" on public.businesses for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists "Vendora products owner" on public.products;
create policy "Vendora products owner" on public.products for all to authenticated
using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()))
with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
drop policy if exists "Vendora orders owner" on public.orders;
create policy "Vendora orders owner" on public.orders for all to authenticated
using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()))
with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
drop policy if exists "Vendora order items owner" on public.order_items;
create policy "Vendora order items owner" on public.order_items for select to authenticated
using(exists(select 1 from public.orders o join public.businesses b on b.id=o.business_id where o.id=order_id and b.owner_id=auth.uid()));

-- Public storefront reads: expose only active products and public business fields.
drop policy if exists "Vendora public active products" on public.products;
create policy "Vendora public active products" on public.products for select to anon, authenticated using(is_active=true);
create or replace view public.storefront_businesses with (security_barrier=true) as
select id,name,slug,category,description,currency from public.businesses;
grant select on public.storefront_businesses to anon, authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('products','products',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
drop policy if exists "Vendora public product images" on storage.objects;
create policy "Vendora public product images" on storage.objects for select to anon,authenticated using(bucket_id='products');
drop policy if exists "Vendora owner product upload" on storage.objects;
create policy "Vendora owner product upload" on storage.objects for insert to authenticated
with check(bucket_id='products' and (storage.foldername(name))[1]=auth.uid()::text);
