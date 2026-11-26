# Vendora 2.0

A premium, mobile-first business workspace built with React, Vite and Supabase.

## Included in this upgrade

- Premium marketing landing page and refreshed design system
- Existing Supabase email/password authentication
- Existing business onboarding
- Responsive business dashboard and mobile navigation
- Overview metrics based on real product/order records
- Product creation, editing, deletion, search and stock filtering
- Product image uploads using the `products` Storage bucket
- Order list and owner-side status updates
- Customer list derived from recorded orders
- Analytics based on existing orders and products
- Business profile settings
- Public storefront route: `/store/{business-slug}`
- Additive Supabase migration for product category, public storefront reads and product image storage policies

## Important before deployment

This project is a substantial upgrade, but it is not a complete payment-enabled marketplace. It does not process payments, create customer checkout orders, send email notifications or provide a production payment webhook. The public storefront is a catalogue; do not advertise payment checkout as available.

## 1. Keep your existing Supabase configuration

The existing `src/lib/supabase.js` uses:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Keep these exact Vercel environment variable names and values. Never add a service-role key to frontend environment variables.

## 2. Apply the additive migration

Before testing the new storefront and product image upload:

1. Open Supabase → SQL Editor.
2. Open `supabase/migration_vendora_2.sql` from this project.
3. Review it, then run it.
4. Confirm that the `products` bucket exists and is public.

The migration adds a product category column, a restricted public business view, public read access to active products, and Storage policies for public image viewing and owner uploads. It does not delete existing data.

The public business view intentionally exposes only the business name, slug, category, description, currency and ID. It does not expose the business phone or owner ID.

## 3. Install and run

```bash
npm install
npm run dev
```

## 4. Build for production

```bash
npm run build
npm run preview
```

Deploy the project to Vercel using the same root directory and environment variables as the existing project.

## 5. Routes

- `/` — marketing page and authentication
- `/store/{business-slug}` — public product catalogue for a business
- Authenticated users — their private business workspace

For a public storefront to load, run the included Supabase migration first.

## Data and security notes

- Existing users, businesses and products are preserved.
- Owner-only access continues to depend on the existing Supabase Row Level Security policies.
- Product uploads are stored in a user-specific folder in the `products` bucket.
- Public visitors can read active products and public product images.
- Customers are currently derived from order records; there is no separate customer table in the starter schema.
- Revenue is calculated from orders whose status is `paid`, `processing`, `shipped` or `completed`.
- The analytics are based on records currently available; no sample/fake sales are inserted.
- The storefront currently supports product discovery only. Checkout and payment processing need a trusted server-side flow and payment-provider webhooks before launch.

## Suggested next milestone

Implement secure checkout with a server-side order creation endpoint, payment provider integration, signed webhook verification, inventory reservation and customer notifications. Do not trust client-submitted totals or mark orders paid based on browser redirects.
