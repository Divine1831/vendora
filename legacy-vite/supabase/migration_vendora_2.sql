-- VENDORA 2.0 additive migration
-- Review this file, then run it in Supabase SQL Editor.
-- This migration does not drop tables or delete existing rows.

alter table public.products
  add column if not exists category text not null default 'General';

create index if not exists products_category_idx
  on public.products(category);

-- Public store profile exposes only fields intended for the public storefront.
create or replace view public.storefront_businesses
with (security_barrier = true)
as
  select id, name, slug, category, description, currency
  from public.businesses;

grant select on public.storefront_businesses to anon, authenticated;

-- Store visitors can view active products only.
drop policy if exists "Public can view active storefront products" on public.products;
create policy "Public can view active storefront products"
on public.products for select
to anon, authenticated
using (is_active = true);

-- Product image storage bucket. Existing bucket is preserved; this only sets it public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- Public visitors can read images in the products bucket.
drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'products');

-- Signed-in owners can upload/update/delete only within their own user folder.
drop policy if exists "Owners upload product images" on storage.objects;
create policy "Owners upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'products'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Owners update product images" on storage.objects;
create policy "Owners update product images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'products'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'products'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Owners delete product images" on storage.objects;
create policy "Owners delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'products'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Existing owner policies for businesses/products/orders remain in place.
-- This storefront does not create orders or accept payments.
