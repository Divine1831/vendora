# VENDORA — Next.js Commerce Operating System

This is a **Stage 1 full-stack migration foundation** for the uploaded `vendora-main` project. It migrates the original Vite + React app into a Next.js App Router structure while retaining the original source and SQL files in `legacy-vite/` for reference.

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

This is a runnable architectural foundation, **not a claim that every feature in the brief is production-complete**. In particular, payment-provider checkout/verification, customer accounts/CRM, full product editing and deletion UI, inventory transaction ledger, discounts/shipping rules, advanced analytics, email notifications, order fulfillment UI, rate limiting, audit logging, automated tests and production security review remain planned work. Do not accept live payments until a payment provider's server-side verification and webhook flow has been implemented and tested.

The `/api/store/[slug]/orders` endpoint creates a pending order from current database prices. It intentionally does not charge a customer. It also needs rate limiting, anti-abuse controls and transactional stock reservation before production launch.

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
6. Verify orders are pending only and no payment is implied.
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
