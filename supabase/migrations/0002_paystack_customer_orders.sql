-- Vendora Paystack + customer order history (additive migration).
-- Review against the live schema and take a backup before applying.

alter table public.orders
  add column if not exists customer_id uuid,
  add column if not exists payment_status varchar(24) not null default 'unpaid',
  add column if not exists payment_reference varchar(100),
  add column if not exists payment_authorization_url text,
  add column if not exists idempotency_key varchar(100),
  add column if not exists inventory_reserved boolean not null default false,
  add column if not exists inventory_issue boolean not null default false,
  add column if not exists expires_at timestamptz,
  add column if not exists paid_at timestamptz;

do $$ begin
  alter table public.orders add constraint orders_customer_id_profiles_fk
    foreign key (customer_id) references public.profiles(id) on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_payment_expiry_idx on public.orders(payment_status, expires_at);
create unique index if not exists orders_payment_reference_unique on public.orders(payment_reference);
create unique index if not exists orders_idempotency_key_unique on public.orders(idempotency_key);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id varchar(180) not null unique,
  event_type varchar(80) not null,
  processed_at timestamptz not null default now()
);
alter table public.payment_webhook_events enable row level security;

-- Customers can read only orders explicitly linked to their authenticated account.
drop policy if exists "Vendora customer own orders" on public.orders;
create policy "Vendora customer own orders" on public.orders
  for select to authenticated using (customer_id = auth.uid());

drop policy if exists "Vendora customer own order items" on public.order_items;
create policy "Vendora customer own order items" on public.order_items
  for select to authenticated using (
    exists(select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );
