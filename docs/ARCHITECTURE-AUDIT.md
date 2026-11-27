# Vendora architecture audit

**Audit basis:** uploaded `vendora-main(2).zip`, including the active Next.js application, legacy Vite source, Drizzle schema, Supabase migrations, API routes and project documentation. The deployed homepage was also inspected on 27 November 2026.

**Important boundary:** this audit does not include access to the live Supabase project, Vercel project settings, production logs, secrets, or a database backup. No live schema or production account changes have been made.

## Current architecture

- Next.js App Router with React 19 and TypeScript.
- Supabase Auth via `@supabase/ssr` browser/server clients and cookie-refresh middleware.
- Drizzle ORM over a direct PostgreSQL connection configured by `DATABASE_URL`.
- Supabase Storage bucket named `products`.
- Existing data model: `profiles`, `businesses`, `products`, `orders`, `order_items`.
- Existing public routes: `/`, `/store/[slug]`, `/store/demo`.
- Existing merchant/auth routes: `/signup`, `/login`, `/dashboard`.
- Existing APIs: health, logout, upload, public order creation and order lookup.
- Original Vite app and SQL files retained under `legacy-vite/`.

## Findings

### Critical before real commerce launch

1. **No payment provider integration exists.** The order endpoint creates `pending` orders only. There is no server-side payment initialization, signature verification, webhook, idempotency key or payment reconciliation. Do not accept or advertise online payments yet.
2. **Public order lookup is not a customer authorization flow.** `/api/store/[slug]/order/[id]` accepts a UUID in the URL and returns order details without an expiring customer token or authenticated customer identity. UUID entropy is not a substitute for an explicit access policy.
3. **Direct Drizzle PostgreSQL access is separate from Supabase Auth RLS context.** The app uses a server-side database connection rather than forwarding the user's Supabase JWT to Postgres. Do not assume Supabase RLS alone protects Drizzle queries. Every merchant query and mutation must include explicit ownership constraints and be tested across two accounts.
4. **Order creation has no transaction, stock reservation, rate limit or idempotency guard.** It correctly derives prices from database product records and creates pending orders, but concurrent or repeated requests can create duplicate orders and oversell inventory.
5. **Production database compatibility is unverified.** The Next.js Drizzle model uses a PostgreSQL `order_status` enum, while the retained legacy SQL/documentation describes a text status with a CHECK constraint. The live column type must be inspected before any migration.

### Important product and UX gaps

- The current product server action only inserts products; there is no complete product management UI, edit/delete flow, product gallery, variant model, search/filter/pagination.
- Storefronts are catalogue-only. They do not currently include cart, customer checkout, online payments, order history or product details.
- Merchant dashboard has overview, recent orders and catalogue snippets, but no full order workflow, customer directory, store settings, staff permissions or notifications.
- Authentication has signup/login and callback handling, but no forgot-password/reset journey, password visibility control or dedicated account settings.
- The current upload route authenticates the caller and validates image MIME/size, but storage mutation policies and business-level asset ownership need broader tests.
- No automated unit, integration or end-to-end test suite is included.
- The public homepage previously displayed illustrative revenue, order counts, chart bars and recent activity as if they were live workspace data. These have been removed in this iteration.

### Existing strengths to preserve

- App Router and TypeScript migration foundation.
- Supabase Auth integration and callback route.
- Existing core table relationships and legacy SQL references.
- Product image upload path and public catalogue pattern.
- Explicit owner checks in the existing workspace/product actions.
- Responsive base styles and existing brand/Launch Studio direction.
- No payment provider or payment-success claim is currently present.

## Phase 1 implementation notes

This iteration is deliberately additive and limited to the application layer:

- Reworked the homepage hero preview to show capabilities rather than fabricated sales metrics.
- Added a real "How it works" section and product-scope FAQ; the FAQ explicitly says payment processing is not enabled.
- Added a mobile navigation menu with accessible toggle state and navigation labels.
- Added reusable CSS tokens and responsive styles for the new sections.
- Corrected dashboard KPI aggregation: total order and product counts now come from database aggregates, paid revenue is aggregated across all qualifying orders, and the visible order panel is explicitly limited to the latest eight records.
- No database migrations, data edits, auth provider changes, environment changes or payment changes were made.

## Phased implementation plan

| Phase | Scope | Exit criteria |
|---|---|---|
| 1. Audit and baseline | Architecture, schema, route, ownership and UX audit | Live schema diff, environment inventory, backup and baseline test report |
| 2. Design system | Tokens, typography, components, responsive primitives, loading/empty/error states | Shared component patterns and responsive visual review |
| 3. Public site and auth | Landing, FAQ, plans that exist, login/signup, reset and verification | Auth flows verified with test accounts |
| 4. Merchant dashboard | Accurate aggregates, revenue trend, order/product/customer views | All metrics reconcile to database queries |
| 5. Store and product management | Store profile, branding, product CRUD, image lifecycle, stock | Ownership tests and storage-policy tests pass |
| 6. Storefront and buyer journey | Discovery, product detail, cart, checkout preparation | Cart/order lifecycle tests pass without implying payment |
| 7. Payments and orders | Provider integration, verified webhooks, idempotency, order lifecycle | Provider sandbox and replay/duplicate tests pass |
| 8. Intelligence | Customer views, analytics, notifications, reports, optional features | Data-backed and permission-tested features only |
| 9. Release hardening | Security, accessibility, performance, observability, deployment | Build, typecheck, lint, automated tests and production smoke tests pass |

## Required live-environment checks before any migration

1. Confirm the GitHub branch/commit and Vercel production commit match the supplied archive.
2. Inspect live tables, column types, indexes, constraints, triggers, views, grants and RLS policies.
3. Inspect Supabase Storage buckets and object policies.
4. Verify all Vercel environment variable names exist without exposing their values.
5. Take a database backup and test a restore path.
6. Test merchant A versus merchant B for every server action, page query and API route.
7. Confirm the deployment uses the intended `DATABASE_URL` role and that server-side ownership filters are comprehensive.

## Validation status

- Source/archive inspection: completed for all 92 archive entries.
- Production homepage inspection: completed.
- Code changes: applied to the supplied local project copy only.
- Dependency installation: attempted but did not complete within the available install timeout.
- TypeScript, lint and production build: **not yet verified**.
- Live Supabase policies/schema, auth, payments, Vercel logs and real device layouts: **not tested**.
