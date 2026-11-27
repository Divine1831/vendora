# Vendora transformation roadmap

## Phase 1 — Framework and data foundation (included)
- Move Vite entry point to Next.js App Router.
- Add strict TypeScript configuration.
- Preserve the original schema and migrations as legacy references.
- Add Drizzle definitions, Supabase Auth server/browser clients, cookie refresh middleware.
- Add Launch Studio, auth screens, dashboard overview, public store, health/upload/order API foundations.

## Phase 2 — Merchant operations
- Product CRUD screens and image manager with ownership checks.
- Order detail, status transitions and fulfillment timeline.
- Inventory movements table with immutable stock adjustments.
- Customer profiles derived from verified order identities.
- Business profile, brand kit, domain and staff permissions.

## Phase 3 — Buyer conversion
- Cart state and persistent cart drawer.
- Product variants, shipping zones and discount codes.
- Checkout validation and guest checkout.
- Payment initialization on server, provider signature verification, idempotent webhooks and receipt page.
- Order tracking using opaque, expiring public tokens rather than guessable IDs.

## Phase 4 — Intelligence and scale
- Date-range analytics and materialized aggregates.
- Notifications and scheduled jobs.
- Rate limiting, bot protection, audit events and observability.
- Automated unit/integration/e2e tests and accessibility review.
- Data retention, privacy and security review before launch.

## Critical compatibility note
The original Vite schema used `orders.status` as text with a CHECK constraint. This Next.js starter models it as a PostgreSQL enum for type safety. Before applying the migration to an existing database, inspect the live column type and keep the database and Drizzle schema aligned. A production migration must be additive and tested against a backup.
