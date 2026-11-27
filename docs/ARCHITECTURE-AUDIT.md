# Vendora architecture audit

> The initial findings and Phase 1–3 notes below are historical baseline observations. The later Phase 4 section records the current local Paystack/customer/order implementation and supersedes earlier statements that no payment integration or buyer account flow exists.

**Audit basis:** uploaded `vendora-main(3).zip`, including the active Next.js application, legacy Vite source, Drizzle schema, Supabase migrations, API routes and project documentation. The deployed homepage was also inspected on 27 November 2026.

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


## Phase 2 implementation notes — merchant product workflow

The current local iteration adds an incremental product-management workflow without changing the database schema:

- Added a searchable merchant catalogue with product name, category, price, stock and publication state.
- Added create and edit forms with browser-side constraints and server-side Zod validation.
- Added archive as a reversible-by-data soft-visibility change (`is_active = false`); no product rows are deleted.
- Added server-side ownership checks for product update and archive mutations, requiring both the signed-in owner and matching business/product IDs.
- Revalidated the merchant dashboard and public storefront after product changes.
- Kept product image handling compatible with the existing public image URL field and upload endpoint; the new form accepts an image URL. A full upload picker/gallery is not yet implemented.
- The dashboard catalogue still loads at most the latest 100 products; pagination and bulk actions remain future work.

## Updated validation status

- The uploaded archive was opened and its application routes, schema, migration, server actions, dashboard, storefront, package manifest and project documentation were inspected.
- Product-management changes were applied to the extracted local copy only.
- `npm ci --ignore-scripts --no-audit --no-fund` was attempted with 120-second and 300-second limits; both exceeded the execution window. An offline retry confirmed the required Zod package tarball is not cached.
- TypeScript, ESLint and production build could not be run because dependency installation did not complete.
- No production deployment, live Supabase inspection, live payment test or database migration was performed.

## Phase 3 implementation notes — customer storefront and order request flow

This local iteration adds the first buyer-facing commerce workflow while keeping the existing schema and provider configuration intact:

- Added a store-scoped shopping bag that persists in browser storage when available, supports quantity changes/removal, and recalculates display totals from the current catalogue.
- Added a responsive checkout details panel with customer name/email validation and clear submission/loading/error states.
- The customer interface explicitly describes the action as an **order request**, not a completed purchase. It states that no payment is collected until a payment provider is configured.
- Hardened the public order endpoint with normalized email, duplicate-product rejection, product availability checks, per-line stock checks, server-derived prices and totals, and a database transaction so order and item records are created atomically.
- No payment provider, payment-success transition, stock decrement, database migration, or production deployment was introduced.

### Remaining commerce blockers

- Select and configure the merchant/payment provider (Paystack, Flutterwave, Stripe, or another supported provider) and supported currencies.
- Add provider initialization, verified webhook signature handling, idempotency storage, payment reconciliation, and atomic stock deduction/reservation only after verified payment.
- Add a customer order-access mechanism; the existing order-detail endpoint still needs a deliberate authenticated or signed-access policy before being promoted as customer order tracking.
- Add rate limiting/bot protection and automated tests for the public order endpoint.
- Add shipping/address and delivery-fee data only after the business model and required schema are agreed.

### Validation status for phase 3

- Source-level review: completed for the new storefront cart/checkout component and order API.
- Dependency installation: `npm ci --ignore-scripts --no-audit --no-fund` timed out in this environment.
- TypeScript, ESLint, production build, database integration and browser/device tests: not run; dependency installation was unavailable.
- No production database or live environment was changed.

## Phase 4 implementation notes — Paystack NGN, customer accounts and order operations

This local source update builds on the existing project; it does not replace the app or apply changes to the live database.

### Implemented in the local source

- Added server-side Paystack transaction initialization using `PAYSTACK_SECRET_KEY`; checkout sends the server-derived amount in kobo and explicitly requests `NGN`.
- Added a hosted-checkout redirect and server-side verification page. A browser redirect alone cannot mark an order paid.
- Added `/api/webhooks/paystack`, which reads the raw request body, verifies the current timestamped `Paystack-Signature` using `PAYSTACK_WEBHOOK_SECRET`, and supports the legacy `x-paystack-signature` during transition.
- Successful webhook events are independently verified with Paystack. Reference, transaction status, amount, currency and (when returned) customer email are compared with the Vendora order before payment is recorded.
- Added unique payment references, unique checkout idempotency keys, webhook event records, 30-minute inventory reservations, an authenticated reservation-expiry endpoint, and late-success inventory review handling.
- Added customer ownership (`orders.customer_id`), a signed-in `/account` area, customer `/account/orders` history, and buyer-or-merchant authorization on the order-detail API.
- Added merchant `/dashboard/orders` search and item/payment/fulfilment summaries, plus guarded `paid → processing → shipped → completed` status progression.
- Added additive migration `0002_paystack_customer_orders.sql`, `.env.example`, and Paystack setup/production-boundary documentation.
- Updated the public FAQ and checkout copy so they no longer describe the checkout as a non-payment order request.

### Important limits and unresolved risks

- The integration is source-complete but **not live-configured or sandbox-verified**. No Paystack credentials were provided, no Paystack request was sent, and no webhook delivery was tested.
- The additive SQL migration has not been applied. The production Supabase schema, existing constraints, RLS and the actual database role used by `DATABASE_URL` remain unverified.
- The platform currently collects into its configured Paystack integration. It does not implement vendor subaccounts, split settlements, merchant payouts, refunds, disputes, shipping/tax calculations or settlement reconciliation.
- Checkout is restricted to NGN. Store workspaces configured for another currency cannot use this Paystack checkout.
- The public checkout API still needs rate limiting/bot protection and a production abuse-monitoring policy.
- The checkout-expiry endpoint must be scheduled in the hosting environment using `CRON_SECRET`. A lazy expiry pass also runs when a new checkout is started, but that is not a replacement for a scheduler.
- Guest checkout is supported, but guest purchases are not attached to an authenticated customer account and therefore do not appear in `/account/orders`.
- Customer profile editing, address book, email receipts, customer notifications, full refund flows and automated end-to-end tests remain outstanding.

### Updated validation status

- TypeScript/TSX syntax transpilation: **passed for 39 source files** using the globally available TypeScript transpiler.
- `npm ci --ignore-scripts --no-audit --no-fund --prefer-offline`: attempted; timed out after 120 seconds. The archive's dependency directory was incomplete and did not provide a usable local TypeScript/Next.js installation.
- Full `tsc --noEmit`, ESLint, Next.js production build, database integration tests, Paystack sandbox tests, webhook replay tests and browser/device tests: **not verified**.
- No Paystack credentials, production secrets, database migration, production data, GitHub repository or Vercel deployment were changed.

## Phase 5 implementation notes — delivery details and tracking

- Checkout now collects buyer phone, street address, city, state and optional postal code for Nigerian delivery.
- The order API validates and persists delivery details while keeping the product amount server-derived. No browser-provided shipping amount is accepted.
- Merchant fulfilment now requires a carrier and tracking number before moving a processing order to shipped; an optional tracking URL must use HTTPS.
- Shipped and completed timestamps are persisted, and tracking information is shown in the authenticated buyer order history.
- Added additive migration `0003_order_fulfilment_tracking.sql` and operational notes in `docs/PHASE5-FULFILMENT.md`.
- **Shipping fees are not calculated or collected.** Checkout clearly discloses that delivery charges and arrangements are handled directly with the merchant. Carrier APIs, delivery notifications, labels, and delivery quotes are not implemented.
- Validation: TypeScript/TSX syntax transpilation passed for 39 files with zero syntax diagnostics. Dependency installation timed out, so full typecheck, lint and production build remain unverified. Migration and live ownership tests have not been run.
