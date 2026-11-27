-- Additive order delivery and tracking details. Review against production schema before applying.
alter table public.orders
  add column if not exists shipping_phone varchar(30),
  add column if not exists shipping_address text,
  add column if not exists shipping_city varchar(100),
  add column if not exists shipping_state varchar(100),
  add column if not exists shipping_postal_code varchar(24),
  add column if not exists shipping_country varchar(80) not null default 'Nigeria',
  add column if not exists tracking_carrier varchar(80),
  add column if not exists tracking_number varchar(120),
  add column if not exists tracking_url text,
  add column if not exists shipped_at timestamptz,
  add column if not exists completed_at timestamptz;

create index if not exists orders_tracking_number_idx on public.orders(tracking_number) where tracking_number is not null;
