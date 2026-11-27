# VENDORA — Next.js Commerce Operating System

This is the existing Vendora Next.js App Router application, evolved incrementally from the uploaded project. The original Vite + React app and SQL files remain preserved under `legacy-vite/` for reference.

## Included

- Next.js App Router + TypeScript
- Supabase Auth using `@supabase/ssr` and cookie-aware middleware
- Drizzle ORM + PostgreSQL schema matching the existing profiles, businesses, products, orders and order_items tables
- SQL migration for a fresh Supabase project (`supabase/migrations/0001_vendora_core.sql`)
- Server actions for workspace creation and product insertion
- Protected merchant dashboard and public store pages
- Live Launch Studio with brand, theme, currency and starting-mode preview
- `/api/health`, `/api/upload`, `/api/auth/logout`, `/api/store/[slug]/orders`
- Demo storefront and seed script
- Original Vite project preserved under `legacy-vite/`

## Important implementation boundary

This is an evolving commerce application, **not a claim that every feature in the brief is production-complete**. The current local source includes Paystack NGN checkout initialization, server-side verification, signed webhooks, checkout idempotency, stock reservation/expiry, customer order history and merchant fulfilment status updates. Live payments must remain disabled until the additive migration is reviewed/applied, Paystack keys and webhook signing secret are configured, scheduler is enabled, and sandbox/security tests pass. Vendor split settlement, merchant payouts, refunds, shipping/tax rules, customer CRM, notifications, rate limiting, audit logging and automated end-to-end tests remain incomplete.

The `/api/store/[slug]/orders` endpoint derives prices from PostgreSQL, reserves stock transactionally, creates an idempotent pending order and initializes Paystack checkout. Rate limiting and broader anti-abuse controls are still required before production launch.

## 1. Requirements

- Node.js 20.9 or newer
- A Supabase project with PostgreSQL, Auth and Storage enabled
- A database connection string from Supabase (prefer the transaction/session pooler for hosted deployments)

## 2. Install

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` with your own Supabase project URL, anon/publishable key and Postgres connection string. Never commit `.env.local`, database passwords, service-role keys or payment secrets.

## 3. Database migration

For a **new empty project**, run:

```bash
npm run db:migrate
```

Or paste `supabase/migrations/0001_vendora_core.sql` into the Supabase SQL Editor.

For an existing Vendora database, **do not run the fresh migration blindly**. The old schema is preserved at `legacy-vite/supabase/schema.sql` and `legacy-vite/supabase/migration_vendora_2.sql`. Compare the live database with `src/db/schema.ts`, take a backup, then apply only missing additive changes. The SQL uses `create table if not exists`, but the enum, indexes, views and policies still need a review against your exact current schema.

## 4. Seed demo data (optional)

```bash
npm run db:seed
```

The optional database seed requires `DEMO_OWNER_ID` to be the UUID of an existing Supabase Auth user. This prevents creating a fake profile that cannot satisfy the `auth.users` foreign key. The `/store/demo` sample page is static and does not need the database seed.

## 5. Run

```bash
npm run dev
```

Open http://localhost:3000. Test `/api/health`, create an account at `/signup`, verify email if enabled, then sign in and create a workspace at `/dashboard`.

## 6. Verify before deployment

```bash
npm run typecheck
npm run lint
npm run build
```

Deploy to Vercel after environment variables are set in Project Settings → Environment Variables. Use the same `DATABASE_URL`, Supabase URL/key and app URL in the deployment environment. Run database migrations once from a trusted environment, not on every web request.

## 7. Data compatibility and cutover plan

1. Back up the existing Supabase project.
2. Compare the current live columns with `legacy-vite/supabase/schema.sql` and `legacy-vite/supabase/migration_vendora_2.sql`.
3. Confirm whether your live `products` table has the `category` column and whether the `order_status` enum exists. The original project used a text status check constraint; the new Drizzle model uses a PostgreSQL enum. If the live DB still uses text, either retain text in Drizzle or apply a reviewed type migration. Do not cast live status values without checking them first.
4. Apply only additive schema changes after backup.
5. Test authentication, workspace ownership, product visibility, uploads and public store access using test accounts.
6. Verify Paystack test checkout, server verification, webhook signature checks, idempotency, inventory reservation/expiry and customer/merchant ownership before enabling live keys.
7. Switch the Vercel deployment only after the new build and data checks pass.

## Architecture map

```text
src/app/                 App Router pages, layouts and API routes
src/components/          Landing, Launch Studio and UI components
src/db/schema.ts         Drizzle database schema
src/lib/actions/         Server actions
src/lib/queries.ts       Server-side data access
src/lib/auth.ts          Auth/session guards
src/lib/format.ts        Currency and date formatting
supabase/migrations/     SQL migration source
scripts/                 Migration and demo seed scripts
legacy-vite/             Original Vite project and original SQL
```

## Paystack checkout and customer order history

The Next.js checkout now initializes Paystack transactions from the server in **NGN only**. Product prices and stock are re-read from PostgreSQL; stock is reserved in the same transaction that creates the pending order. A payment is marked paid only after a server-side Paystack verification confirms the reference, successful status, amount and currency. The signed webhook is the primary asynchronous confirmation path.

### Required environment variables

Copy `.env.example` to `.env.local` and configure:

- `PAYSTACK_SECRET_KEY` — server-only Paystack test/live secret key.
- `PAYSTACK_WEBHOOK_SECRET` — Paystack webhook signing secret (`whsec_...`).
- `NEXT_PUBLIC_APP_URL` — canonical public application URL used for the Paystack callback.
- `CRON_SECRET` — long random secret protecting expired-checkout cleanup.

Never prefix the Paystack secret or webhook secret with `NEXT_PUBLIC_`, and never commit real keys.

### Database migration

After taking a database backup and checking the existing live columns, apply `supabase/migrations/0002_paystack_customer_orders.sql`. It adds payment references/status, customer ownership, inventory reservation/expiry fields and webhook idempotency records. This migration is additive; it does not delete or rewrite existing orders. Existing orders retain `payment_status = 'unpaid'` and must not be treated as paid retroactively.

Do not run this migration against production until you have compared it with the live Supabase schema and confirmed the existing `order_status` enum and `profiles` foreign key.

### Paystack dashboard setup

Set the webhook URL to:

`https://YOUR_DOMAIN/api/webhooks/paystack`

Configure the webhook signing secret in the Paystack dashboard and store it as `PAYSTACK_WEBHOOK_SECRET`. The handler verifies the raw request body using the timestamped `Paystack-Signature` format, with legacy `x-paystack-signature` support during transition. Successful events are independently verified against Paystack before an order is marked paid.

### Expired inventory reservations

Checkout reservations expire after 30 minutes. Configure a trusted scheduler to send an authenticated `GET` request to `/api/cron/expire-checkouts` every 10–15 minutes with:

`Authorization: Bearer $CRON_SECRET`

The endpoint releases stock for unpaid expired orders. If a payment succeeds after a reservation expired, the order is still recorded as paid; if stock cannot be re-reserved, the merchant dashboard flags it for manual stock review before fulfilment.

### Customer and merchant access

Signed-in buyers can see only orders linked to their Supabase user ID at `/account/orders`. Guest checkout remains available, but guest purchases do not appear in an account order history. The order-detail API now requires authentication and checks either buyer ownership or merchant ownership. Merchants can progress paid orders through processing, shipped and completed; an inventory-review order must successfully reserve stock before it can move to processing.

### Important marketplace boundary

This implementation collects customer payments into the Vendora Paystack integration. It does **not** yet split funds automatically between vendors or execute merchant payouts. Paystack subaccounts, split rules, settlement reconciliation, refunds, shipping charges and tax configuration require separate merchant onboarding and explicit business rules. Do not promise automatic vendor settlement until those flows are implemented and tested.

### Validation still required before production

Use Paystack test keys and a staging Supabase database. Test successful, failed, abandoned, duplicate and delayed webhook deliveries; mismatched amounts/currencies; stock contention; checkout expiry; late successful payments; customer/merchant access isolation; and the full Vercel build. Production credentials, webhook delivery and live database compatibility have not been verified in this source-only update.
